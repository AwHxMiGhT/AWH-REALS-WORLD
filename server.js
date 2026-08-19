const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// قراءة JSON من الطلبات
app.use(express.json());

// تقديم ملفات الموقع
app.use(express.static(path.join(__dirname, "public")));

// اختبار السيرفر
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working!"
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});