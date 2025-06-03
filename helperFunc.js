function convertUTCToLocal(utcString) {
    let date = new Date(utcString);
    return date.toLocaleString("en-US", { timeZone: "Asia/Vientiane" });
}

module.exports = { convertUTCToLocal };