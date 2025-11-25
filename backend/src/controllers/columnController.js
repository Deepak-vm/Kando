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
        const column = await prisma.column.create({
            data: {
                name,
                boardId
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
                name: 'asc'
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
        const { name} = req.body;
        const { id } = req.params;
        const userId = req.user.userId;

        if(!name) {
            return res.status(400).json({ message: "Column name is required" });
        }

        const column = await checkColumnOwnership(id, userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        const updatedColumn = await prisma.column.update({
            where: { id: req.params.id },
            data: { name }
        });
        res.status(200).json({
            message: "Column updated successfully",
            updatedColumn
        })
    } catch (err) {
        console.error('Get columns error:', err);
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
        console.error('Delete board error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createColumn, getColumns, updateColumn, deleteColumn };
