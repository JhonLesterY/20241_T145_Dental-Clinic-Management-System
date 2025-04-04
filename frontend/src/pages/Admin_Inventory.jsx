import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import AdminSideBar from "../components/AdminSideBar";
import { FaEdit } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Admin_Inventory = () => {
    const { isDarkMode } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentEditor, setCurrentEditor] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newItem, setNewItem] = useState({
        itemName: '',
        quantity: '',
        unit: '',
        price: '',
        expiryDate: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleAddButtonClick = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/inventory/check-lock', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.locked) {
                setCurrentEditor(data.currentEditor);
                alert(`Another admin (${data.currentEditor}) is currently modifying inventory. Please try again later.`);
                return;
            }

            // If not locked, acquire the lock and open modal
            const lockResponse = await fetch('http://localhost:5000/admin/inventory/acquire-lock', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (lockResponse.ok) {
                setShowAddModal(true);
            }
        } catch (error) {
            console.error('Error checking lock:', error);
            alert('Error checking inventory access. Please try again.');
        }
    };

    const handleCloseModal = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const itemId = editingItem?._id;
            const endpoint = itemId 
                ? `http://localhost:5000/admin/inventory/release-lock/${itemId}`
                : 'http://localhost:5000/admin/inventory/release-lock';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to release lock');
            }

            // Reset states based on which modal is open
            if (showAddModal) {
                setShowAddModal(false);
                setNewItem({
                    itemName: '',
                    quantity: '',
                    unit: '',
                    price: '',
                    expiryDate: ''
                });
            }
            
            if (showEditModal) {
                setShowEditModal(false);
                setEditingItem(null);
            }
            
            setIsLocked(false);
            setCurrentEditor(null);
        } catch (error) {
            console.error('Error in handleCloseModal:', error);
            alert('Error closing modal. Please try again.');
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup function to release lock when component unmounts
            const token = sessionStorage.getItem('token');
            if (token) {
                fetch('http://localhost:5000/admin/inventory/release-lock', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(error => console.error('Error releasing lock on unmount:', error));
            }
        };
    }, []);

    useEffect(() => {
        let pollInterval;
        
        const checkLockStatus = async () => {
            if (!showAddModal) return; // Only check when modal is open
            
            const token = sessionStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/admin/inventory/check-lock', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                
                setIsLocked(data.locked && data.currentEditor !== req.user._id);
                setCurrentEditor(data.currentEditor);
            } catch (error) {
                console.error('Error polling lock status:', error);
            }
        };

        if (showAddModal) {
            checkLockStatus(); // Initial check
            pollInterval = setInterval(checkLockStatus, 5000); // Poll every 5 seconds
        }

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [showAddModal]);

    // Fetch inventory items
    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/admin/inventory', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setInventoryItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkLock = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/inventory/check-lock', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setIsLocked(data.locked);
            if (data.locked) {
                alert('Another admin is currently modifying inventory. Please try again later.');
            }
            return data.locked;
        } catch (error) {
            console.error('Error checking lock:', error);
            return true; // Assume locked on error
        }
    };
    
    const handleAddItem = async (e) => {
        e.preventDefault();
        
        try {
            const token = sessionStorage.getItem('token');
            
            // Acquire the lock first
            const lockResponse = await fetch('http://localhost:5000/admin/inventory/acquire-lock', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const lockStatus = await lockResponse.json();
            
            if (lockStatus.locked) {
                alert('Another admin is currently modifying inventory. Please try again later.');
                return;
            }

            // Proceed with adding item
            const itemData = {
                ...newItem,
                quantity: Number(newItem.quantity),
                price: Number(newItem.price)
            };

            const response = await fetch('http://localhost:5000/admin/inventory', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                alert('Item added successfully');
                setShowAddModal(false);
                setNewItem({
                    itemName: '',
                    quantity: '',
                    unit: '',
                    price: '',
                    expiryDate: ''
                });
                fetchInventory();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert(error.message);
        } finally {
            // Always release the lock in finally block
            try {
                const token = sessionStorage.getItem('token');
                await fetch('http://localhost:5000/admin/inventory/release-lock', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Error releasing lock:', error);
            }
        }
    };

    const handleNumberInput = (e, field) => {
        const value = e.target.value;
        setNewItem(prev => ({
            ...prev,
            [field]: value === '' ? '' : Number(value)
        }));
    };

    const handleEditButtonClick = async (item) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/admin/inventory/check-lock/${item._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.locked) {
                setCurrentEditor(data.currentEditor);
                alert(`Another admin (${data.currentEditor}) is currently modifying this item. Please try again later.`);
                return;
            }

            // If not locked, acquire the lock and open modal
            const lockResponse = await fetch(`http://localhost:5000/admin/inventory/acquire-lock/${item._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (lockResponse.ok) {
                setEditingItem({
                    ...item,
                    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
                });
                setShowEditModal(true);
            }
        } catch (error) {
            console.error('Error checking lock:', error);
            alert('Error checking inventory access. Please try again.');
        }
    };

    const handleUpdateItem = async (itemData) => {
        try {
            const token = sessionStorage.getItem('token');
            
            // Log the item being updated
            console.log('Updating item:', editingItem);

            const itemData = {
                ...editingItem,
                quantity: Number(editingItem.quantity),
                price: Number(editingItem.price)
            };

            const response = await fetch(`http://localhost:5000/admin/inventory/${itemData._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                alert('Item updated successfully');
                setShowEditModal(false);
                setEditingItem(null);
                fetchInventory();
            } else {
                const errorData = await response.json();
                console.error('Update error:', errorData);
                throw new Error(errorData.message || 'Failed to update item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert(error.message);
        }
    };

    return (
        <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            {isLoading ? (
                <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
                    {/* Blurred overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Inventory Data...</h2>
                        </div>
                    </div>
                    
                    {/* Placeholder header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                            <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Inventory Management</span>
                        </div>
                    </div>
                    
                    {/* Placeholder main content */}
                    <div className="flex-1 p-6"></div>
                </div>
            ) : (
                <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
                    {/* Header */}
                    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                                <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>
                                    Inventory
                                </h1>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleAddButtonClick}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add New Item
                                </button>
                                <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}>
                                    <img className="w-6 h-6" src={bell} alt="Notifications" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Inventory Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {inventoryItems.map((item) => (
                                <div key={item._id} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {item.itemName}
                                        </h3>
                                        <button
                                            onClick={() => handleEditButtonClick(item)}
                                            className={`${isDarkMode ? 'bg-gray-700 text-blue-400' : 'text-blue-500 bg-green-100'} hover:text-blue-700 p-2 rounded-md`}
                                        >
                                            <FaEdit />
                                        </button>
                                    </div>
                                    <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <p>Quantity: {item.quantity} {item.unit}</p>
                                        <p>Price: ₱{item.price.toFixed(2)}</p>
                                        {item.expiryDate && (
                                            <p>Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Item Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-96">
                                <h2 className="text-2xl font-bold mb-4 text-black">Add New Item</h2>
                                {isLocked && (
                                    <div className="mb-4 text-red-500 text-sm">
                                        Another admin is currently modifying inventory. Please try again later.
                                    </div>
                                )}
                                <form onSubmit={handleAddItem}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                            <input
                                                type="text"
                                                value={newItem.itemName}
                                                onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                            <input
                                                type="number"
                                                value={newItem.quantity}
                                                onChange={(e) => handleNumberInput(e, 'quantity')}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                                            <input
                                                type="text"
                                                value={newItem.unit}
                                                onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price</label>
                                            <input
                                                type="number"
                                                value={newItem.price}
                                                onChange={(e) => handleNumberInput(e, 'price')}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={newItem.expiryDate}
                                                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLocked}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Item Modal */}
                    {showEditModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-96">
                                <h2 className="text-2xl font-bold mb-4 text-black">Edit Item</h2>
                                <form onSubmit={handleUpdateItem}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                            <input
                                                type="text"
                                                value={editingItem.itemName}
                                                onChange={(e) => setEditingItem({...editingItem, itemName: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                            <input
                                                type="number"
                                                value={editingItem.quantity}
                                                onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                                            <input
                                                type="text"
                                                value={editingItem.unit}
                                                onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price</label>
                                            <input
                                                type="number"
                                                value={editingItem.price}
                                                onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={editingItem.expiryDate}
                                                onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Update Item
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin_Inventory;
