let db;
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
async function init() {
    db = await idb.openDb('books', 1, db => {
        db.createObjectStore('books', {keyPath: 'name'});
    });
  
    list();
}

async function list() {
    let tx = db.transaction('books');
    let bookStore = tx.objectStore('books');
  
    let books = await bookStore.getAll();
  
    if (books.length) {
        listElem.innerHTML = books.map(book => `<li>
            name: ${book.name}, price: ${book.price}
            </li>`).join('');
    } else {
        listElem.innerHTML = '<li>No books yet. Please add books.</li>'
    }
}

async function clearBooks() {
    let tx = db.transaction('books', 'readwrite');
    await tx.objectStore('books').clear();
    await list();
}
  
async function addBook() {
    let name = prompt("Book name?");
    let price = +prompt("Book price?");
  
    let tx = db.transaction('books', 'readwrite');
  
    try {
        await tx.objectStore('books').add({name, price});
        await list();
    } catch(err) {
        if (err.name == 'ConstraintError') {
            alert("Such book exists already");
            await addBook();
        } else {
            throw err;
        }
    }
} 

window.addEventListener('unhandledrejection', event => {
    alert("Error: " + event.reason.message);
});

init();