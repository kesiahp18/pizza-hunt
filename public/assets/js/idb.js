//create variable to hold db connection
let db;
//establish a connection to IndexedDB database with version 1
const request = indexedDB.open('pizza_hunt', 1);

//this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    //create `new_pizza` object store with autoincrementing primary key
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function(event) {
    //save in global variable
    db = event.target.result;

    if (navigator.online) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    //log error here
    console.log(event.target.errorCode);
}

//if user attempts to add a new pizza with no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //acess the object store for new_pizza
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    //open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //set to a variable
    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/pizzas', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
    
              const transaction = db.transaction(['new_pizza'], 'readwrite');
              const pizzaObjectStore = transaction.objectStore('new_pizza');
              // clear all items in your store
              pizzaObjectStore.clear();
            })
            .catch(err => {
              // set reference to redirect back here
              console.log(err);
            });
        }
      };
    }
    
    // listen for app coming back online
    window.addEventListener('online', uploadPizza);
    