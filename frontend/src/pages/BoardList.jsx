import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { boardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { FormField, Input } from '../components/ui/form';

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [creating, setCreating] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const response = await boardAPI.getAll();
            setBoards(response.data.boards);
        } catch (error) {
            toast.error('Failed to fetch boards');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!boardName.trim()) return;

        setCreating(true);
        try {
            const response = await boardAPI.create({ name: boardName });
            setBoards([...boards, response.data.board]);
            toast.success('Board created successfully!');
            setOpen(false);
            setBoardName('');
        } catch (error) {
            toast.error('Failed to create board');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteBoard = async (id) => {
        if (!confirm('Are you sure you want to delete this board?')) return;

        try {
            await boardAPI.delete(id);
            setBoards(boards.filter((board) => board.id !== id));
            toast.success('Board deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete board');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading boards...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
                    <Button onClick={logout} variant="danger">
                        Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <button
                        onClick={() => setOpen(true)}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center min-h-[200px]"
                    >
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <p className="mt-2 text-lg font-medium text-gray-600">
                                Create New Board
                            </p>
                        </div>
                    </button>

                    {/* Board Cards */}
                    {(boards || []).map((board) => (
                        <div
                            key={board.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow min-h-[200px] flex flex-col"
                        >
                            <Link
                                to={`/boards/${board.id}`}
                                className="flex-1 p-6 hover:bg-gray-50 rounded-t-lg"
                            >
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {board.name}
                                </h3>

                            </Link>
                            <div className="px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleDeleteBoard(board.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    Delete Board
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </main>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Create New Board"
            >
                <form onSubmit={handleCreateBoard}>
                    <DialogContent>
                        <FormField label="Board Name" htmlFor="boardName">
                            <Input
                                id="boardName"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                                placeholder="Enter board name"
                                autoFocus
                            />
                        </FormField>
                    </DialogContent>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || !boardName.trim()}
                        >
                            {creating ? 'Creating...' : 'Create Board'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </div>
    );
};

export default BoardList;