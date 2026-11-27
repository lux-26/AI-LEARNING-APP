import "dotenv/config";
import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI is required. No database operation was performed.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  const collection = mongoose.connection.collection("chathistories");

  const [duplicateGroups, orphanGroups] = await Promise.all([
    collection.aggregate([
      { $group: { _id: { userId: "$userId", documentId: "$documentId" }, count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
      { $project: { _id: 1, count: 1, ids: 1 } },
    ]).toArray(),
    collection.aggregate([
      { $lookup: { from: "documents", localField: "documentId", foreignField: "_id", as: "document" } },
      { $match: { document: { $eq: [] } } },
      { $project: { _id: 1, userId: 1, documentId: 1 } },
    ]).toArray(),
  ]);

  console.log(JSON.stringify({
    readOnly: true,
    duplicateGroupCount: duplicateGroups.length,
    duplicateGroups,
    orphanHistoryCount: orphanGroups.length,
    orphanHistories: orphanGroups,
    note: "Aucun document ni index n'a été modifié. Examinez les doublons avant toute migration.",
  }, null, 2));
} catch (error) {
  console.error("Chat history audit failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
