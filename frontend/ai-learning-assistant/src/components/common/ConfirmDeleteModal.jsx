import { Trash2, X } from "lucide-react";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-red-100 p-3 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fermer"
            className="rounded-lg p-1 text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">
          Confirmer la suppression
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          Êtes-vous sûr de vouloir supprimer{" "}
          {itemName ? (
            <span className="font-semibold text-gray-900">« {itemName} »</span>
          ) : (
            "cet élément"
          )}{" "}
          ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {isLoading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
