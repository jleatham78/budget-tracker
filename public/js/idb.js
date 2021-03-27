let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    console.log(db);
    db.createObjectStore('new_deposit', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log(db);
 
    if (navigator.onLine) {
        uploadDeposit();
    }

};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_deposit'], 'readwrite');

    const depositObjectStore = transaction.objectStore('new_deposit');

    depositObjectStore.add(record);
}

function uploadDeposit() {
    const transaction = db.transaction(['new_deposit'], 'readwrite');

    const depositObjectStore = transaction.objectStore('new_deposit');

    const getAll = depositObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
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
                const transaction = db.transaction(['new_deposit'], 'readwrite');
                const depositObjectStore = transaction.objectStore('new_deposit');
                depositObjectStore.clear();

                alert('Transaction has been submitted.');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

window.addEventListener('online', uploadDeposit);