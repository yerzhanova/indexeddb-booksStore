let db = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

async function addBook() {
    //to do check for value type
    let name = prompt("Book name?");
    let price = +prompt("Book price?");
  
    let transaction = db.transaction('books', 'readwrite');
    let books = transaction.objectStore("books"); 
    let request = books.add({name: name, price: price}); 

    request.onsuccess = function() { 
        console.log("Книга добавлена в хранилище", request.result);
    };

    request.onerror = function() {
        if (request.error.name == "ConstraintError") {
            console.log("Книга с таким id уже существует");
        } else {
            console.log("Ошибка", request.error);
        }
    };
    await list();
} 

async function list() {
    var request = db.transaction('books', "readonly").objectStore('books').getAll();
    request.onsuccess = function(){
        if (request.result.length) {
            listElem.innerHTML = request.result.map(book => `<li>
            name: ${book.name}, price: ${book.price}
            </li>`).join('');
        } else {
            listElem.innerHTML = '<li>No books yet. Please add books.</li>'
        }
    }
    request.onerror = () => {
        console.log(request.error);
    };
}

async function clearBooks() {
    let transaction = db.transaction('books', 'readwrite');
    await transaction.objectStore('books').clear();
    await list();
}

window.addEventListener('unhandledrejection', event => {
    alert("Error: " + event.reason.message);
});

async function init() {

    let openRequest = indexedDB.open('books', 1);
        
    openRequest.onupgradeneeded = function() {
        console.log('onupgradeneeded');
        let db = openRequest.result;
        if (!db.objectStoreNames.contains('books')) { // если хранилище "books" не существует
            db.createObjectStore('books', {keyPath: 'name', autoIncrement: true}); // создаем хранилище
            console.log("db", db);
        }
        // срабатывает, если на клиенте нет базы данных
        // ...выполнить инициализацию...
    };
    
    openRequest.onerror = function() {
        console.error("Error", openRequest.error);
        console.log("Текущая версия базы выше требуемой. Удалите БД из indexeddb для корректной работы");
        let deleteRequest = indexedDB.deleteDatabase('booksDb');
    };
    
    openRequest.onsuccess = function() {
        db = openRequest.result;
        console.log('onsuccess');
        db.onversionchange = function() {
            db.close();
            alert("База данных устарела, пожалуста, перезагрузите страницу.")
        };
        // продолжить работу с базой данных, используя объект db
    };

    openRequest.onblocked = function() {
        alert("Закройте все вкладки");
      // есть другое соединение к той же базе
      // и оно не было закрыто после срабатывания на нём db.onversionchange
    };
}

init();
