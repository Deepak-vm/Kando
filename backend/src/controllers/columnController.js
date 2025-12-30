import { prisma } from "../config/prisma.js";

const checkBoardOwnership = async (boardId, userId) => {
    const board = await prisma.board.findFirst({
        where: {
            id: boardId,
            userId: userId
        }
    });
    return board;
}

const checkColumnOwnership = async (columnId, userId) => {
    const column = await prisma.column.findFirst({
        where: {
            id: columnId,
            board: {
                userId: userId
            }
        }
    });
    return column;
}

const createColumn = async (req, res) => {
    try {
        const { name } = req.body;
        const { boardId } = req.params;
        const userId = req.user.userId;

        const board = await checkBoardOwnership(boardId, userId);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        if (!name) {
            return res.status(400).json({ message: "Column name is required" });
        }

        // Get max position
        const maxPosition = await prisma.column.aggregate({
            where: { boardId },
            _max: { position: true }
        });

        const column = await prisma.column.create({
            data: {
                name,
                boardId,
                position: (maxPosition._max.position || 0) + 1
            }
        });

        res.status(201).json({
            message: "Column created successfully",
            column
        })
    } catch (err) {
        console.error('Create column error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getColumns = async (req, res) => {
    try {
        const { boardId } = req.params;
        const userId = req.user.userId;

        const board = await checkBoardOwnership(boardId, userId);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const columns = await prisma.column.findMany({
            where: {
                boardId
            },
            orderBy: {
                position: 'asc'
            }
        });

        res.status(200).json({
            message: "Columns retrieved successfully",
            columns
        })
    } catch (err) {
        console.error('Get columns error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateColumn = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ message: "Column name is required" });
        }

        const column = await checkColumnOwnership(id, userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        const updatedColumn = await prisma.column.update({
            where: { id },
            data: { name }
        });

        res.status(200).json({
            message: "Column updated successfully",
            column: updatedColumn
        })
    } catch (err) {
        console.error('Update column error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteColumn = async (req, res) => {
    try {
        const column = await checkColumnOwnership(req.params.id, req.user.userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        const deletedColumn = await prisma.column.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({
            message: "Column deleted successfully",
            column: deletedColumn
        });
    } catch (err) {
        console.error('Delete column error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Reorder columns
const reorderColumns = async (req, res) => {
    try {
        const { boardId, sourceIndex, destinationIndex } = req.body;
        const userId = req.user.userId;

        const board = await checkBoardOwnership(boardId, userId);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const columns = await prisma.column.findMany({
            where: { boardId },
            orderBy: { position: 'asc' }
        });

        // Reorder columns array
        const [movedColumn] = columns.splice(sourceIndex, 1);
        columns.splice(destinationIndex, 0, movedColumn);

        // Update positions
        await Promise.all(
            columns.map((col, index) =>
                prisma.column.update({
                    where: { id: col.id },
                    data: { position: index }
                })
            )
        );

        res.status(200).json({
            message: "Columns reordered successfully"
        });
    } catch (err) {
        console.error('Reorder columns error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { createColumn, getColumns, updateColumn, deleteColumn, reorderColumns };
