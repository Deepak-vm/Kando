import { prisma } from "../config/prisma.js";

const getBoardById = async (boardId, userId) => {
    return await prisma.board.findFirst({
        where: {
            id: boardId,
            userId: userId
        }
    });
}

const createBoard = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ message: "Board name is required" });
        }
        const board = await prisma.board.create({
            data: {
                name,
                userId
            }
        });
        res.status(201).json({
            message: "Board created successfully",
            board
        })
    } catch (err) {
        console.error('Create board error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getBoards = async (req, res) => {
    try {
        const userId = req.user.userId;
        const boards = await prisma.board.findMany({
            where: {
                userId
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.status(200).json({
            boards
        });
    } catch (err) {
        console.error('Get boards error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getBoard = async (req, res) => {
    try {
        const board = await prisma.board.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            include: {
                columns: {
                    include: {
                        tasks: true
                    }
                }
            }
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        res.status(200).json({ board });
    } catch (err) {
        console.error('Get board error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const updateBoard = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Board name is required" });
        }

        const board = await getBoardById(req.params.id, req.user.userId);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const updatedBoard = await prisma.board.update({
            where: { id: req.params.id },
            data: { name }
        });

        res.status(200).json({
            message: "Board updated successfully",
            board: updatedBoard
        });
    } catch (err) {
        console.error('Update board error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const deleteBoard = async (req, res) => {
    try {
        const board = await getBoardById(req.params.id, req.user.userId);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        const deletedBoard = await prisma.board.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({
            message: "Board deleted successfully",
            board: deletedBoard
        });
    } catch (err) {
        console.error('Delete board error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createBoard, getBoards, getBoard, updateBoard, deleteBoard };
