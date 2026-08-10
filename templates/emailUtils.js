const fs = require("fs");
const path = require("path");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}

function logoAttachment() {
    return {
        content: fs.readFileSync(path.join(__dirname, "..", "assets", "logo-ludos.png")).toString("base64"),
        filename: "logo-ludos.png",
        type: "image/png",
        disposition: "inline",
        content_id: "logo-ludos"
    };
}

module.exports = { escapeHtml, logoAttachment };
