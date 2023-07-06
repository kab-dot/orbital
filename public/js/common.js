const sendData = (path, data) => {
    console.log(data);
    fetch(path, {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/js'}),
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => processData(data));
}

const processData = (data) => {
    console.log(data);
}

const showFormErr = (err) => {
let errorGIF = document.querySelector('.error');
errorGIF.innerHTML = err;
errorGIF.classList.add('show');

}