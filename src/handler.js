const { nanoid } = require("nanoid")
const books = require("./books")
const ErrorResponse = require("./errorHandler")

const addBook = (request, h) => {
    const {
        name,
        author,
        year,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload

    const id = nanoid(16)
    const dateNow = new Date().toISOString()
    const finished = pageCount === readPage

    try {
        if (!name) throw new ErrorResponse(
            'Gagal menambahkan buku. Mohon isi nama buku',
            ErrorResponse.CODE.BAD_REQUEST,
            'fail'
        )

        if (readPage > pageCount) throw new ErrorResponse(
            'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
            ErrorResponse.CODE.BAD_REQUEST,
            'fail'
        )

        books.push({
            id,
            name,
            author,
            year,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            finished,
            insertedAt: dateNow,
            updatedAt: dateNow
        })

        return h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id
            }
        }).code(201)

    } catch (error) {
        if (error instanceof ErrorResponse) {
            return h.response({
                status: error.status,
                message: error.message
            }).code(error.code)
        }

        return h.response({
            status: 'error',
            message: 'Buku gagal ditambahkan'
        }).code(ErrorResponse.CODE.INTERNAL_SERVER_ERROR)
    }
}

const getAllBooks = (request, h) => {
    const { name, reading, finished } = request?.query || {}
    let _books = books

    if (name) {
        _books = _books.reduce((filteredBook, book) => {
            const isContainWord = book.name.toLowerCase().split(' ').includes(name.toLowerCase())
            if (isContainWord) {
                filteredBook.push(book)
            }
            return filteredBook
        }, [])
    }

    if (reading) {
        const isReading = reading === '1'
        _books = _books.filter(book => book.reading === isReading)
    }

    if (finished) {
        const isFinished = finished === '1'
        _books = _books.filter(book => book.finished === isFinished)
    }

    _books = _books.map(book => {
        const { id, name, publisher } = book
        return { id, name, publisher }
    })

    return h.response({
        status: 'success',
        data: {
            books: _books
        }
    }).code(200)
}

const getBookById = (request, h) => {
    const { bookId } = request.params

    try {
        const indexBook = books.findIndex(book => book.id === bookId)

        if (indexBook == -1) {
            throw new ErrorResponse(
                'Buku tidak ditemukan',
                ErrorResponse.CODE.NOT_FOUND,
                'fail'
            )
        }

        return ({
            status: 'success',
            data: {
                book: books[indexBook]
            }
        })
    } catch (error) {
        return ErrorResponse.bind(error, h)
    }
}

const editBookById = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload

    const { bookId } = request.params
    const dateNow = new Date().toISOString()
    const finished = pageCount === readPage

    try {
        const indexBook = books.findIndex(book => book.id == bookId)

        if (indexBook === -1) throw new ErrorResponse(
            'Gagal memperbarui buku. Id tidak ditemukan',
            ErrorResponse.CODE.NOT_FOUND,
            'fail'
        )

        if (!name) throw new ErrorResponse(
            'Gagal memperbarui buku. Mohon isi nama buku',
            ErrorResponse.CODE.BAD_REQUEST,
            'fail'
        )

        if (readPage > pageCount) throw new ErrorResponse(
            'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            ErrorResponse.CODE.BAD_REQUEST,
            'fail'
        )

        books[indexBook] = {
            ...books[indexBook],
            name,
            author,
            year,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            finished,
            updatedAt: dateNow
        }

        return h.response({
            status: "success",
            message: "Buku berhasil diperbarui"
        }).code(200)

    } catch (error) {
        return ErrorResponse.bind(error, h)
    }
}

const deleteBookById = (request, h) => {
    const { bookId } = request.params

    try {
        const indexBook = books.findIndex(book => book.id === bookId)
        if (indexBook === -1) throw new ErrorResponse(
            'Buku gagal dihapus. Id tidak ditemukan',
            ErrorResponse.CODE.NOT_FOUND,
            'fail'
        )

        books.splice(indexBook, 1)

        return h.response({
            status: "success",
            message: "Buku berhasil dihapus"
        }).code(200)
    } catch (error) {
        return ErrorResponse.bind(error, h)
    }
}

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    editBookById,
    deleteBookById
}