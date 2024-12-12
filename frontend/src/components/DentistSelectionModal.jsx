const DentistSelectionModal = ({ isOpen, onClose, onSelect, dentists }) => {
    return (
        isOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <h3 className="text-lg font-medium mb-4">Select Dentist</h3>
                    <div className="max-h-60 overflow-y-auto">
                        {dentists.map(dentist => (
                            <button
                                key={dentist.dentist_id}
                                onClick={() => onSelect(dentist)}
                                className="w-full text-left p-3 hover:bg-gray-100 border-b"
                            >
                                {dentist.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}; 