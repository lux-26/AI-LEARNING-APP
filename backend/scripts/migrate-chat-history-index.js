import "dotenv/config";
import mongoose from "mongoose";
import ChatHistory from "../models/ChatHistory.js";

const mongoUri = process.env.MONGODB_URI;
const confirmed = process.env.CONFIRM_CHAT_HISTORY_INDEX_MIGRATION === "YES";
const writesPaused = process.env.PAUSE_APP_WRITES === "YES";

if (!mongoUri) {
  console.error("MONGODB_URI is required. No database operation was performed.");
  process.exit(1);
}
if (!confirmed || !writesPaused) {
  console.error(
    "Migration blocked. Set CONFIRM_CHAT_HISTORY_INDEX_MIGRATION=YES and PAUSE_APP_WRITES=YES only after reviewing the audit, taking a backup, and stopping application writes.",
  );
  process.exit(1);
}

const indexOptionsToRestore = (index) => {
  const allowedOptions = [
    "name",
    "unique",
    "sparse",
    "expireAfterSeconds",
    "partialFilterExpression",
    "collation",
    "hidden",
    "wildcardProjection",
    "weights",
    "default_language",
    "language_override",
    "textIndexVersion",
    "2dsphereIndexVersion",
    "bits",
    "min",
    "max",
    "bucketSize",
    "storageEngine",
  ];
  return Object.fromEntries(
    allowedOptions
      .filter((key) => index[key] !== undefined)
      .map((key) => [key, index[key]]),
  );
};

try {
  await mongoose.connect(mongoUri);
  const collection = ChatHistory.collection;

  const duplicates = await collection.aggregate([
    {
      $group: {
        _id: { userId: "$userId", documentId: "$documentId" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();

  if (duplicates.length) {
    throw new Error(
      "Migration aborted: duplicate (userId, documentId) histories exist. Resolve them manually after backup, then rerun the read-only audit.",
    );
  }

  const indexes = await collection.indexes();
  const existing = indexes.find((index) => {
    const keys = Object.keys(index.key || {});
    return (
      keys.length === 2 &&
      index.key.userId === 1 &&
      index.key.documentId === 1
    );
  });

  if (existing?.unique === true && !existing.sparse && !existing.partialFilterExpression) {
    console.log("The required unique index already exists. No change was necessary.");
  } else {
    let previousIndexDropped = false;

    if (existing) {
      await collection.dropIndex(existing.name);
      previousIndexDropped = true;
    }

    try {
      await collection.createIndex(
        { userId: 1, documentId: 1 },
        { unique: true, name: "userId_1_documentId_1" },
      );
      console.log("Unique chat history index created successfully.");
    } catch (creationError) {
      if (previousIndexDropped) {
        try {
          await collection.createIndex(
            existing.key,
            indexOptionsToRestore(existing),
          );
          console.error("Unique index creation failed; the previous index was restored.");
        } catch (restoreError) {
          throw new Error(
            `Unique index creation failed (${creationError.message}); restoring the previous index also failed (${restoreError.message}). Stop application writes and restore the index manually from the recorded backup/index definition.`,
          );
        }
      }
      throw creationError;
    }
  }
} catch (error) {
  console.error("Chat history index migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
