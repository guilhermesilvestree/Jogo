let dev = false
export function alertMessage(messageTime, id) {
    const box = document.getElementById(id)
    box.style.scale = '1'
    setTimeout(() => {
        box.style.scale = '0'
    }, messageTime);
}

export function log(message, user) {
    if (dev || user) {
        console.log(message);
    }
}