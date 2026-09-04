// 1. تحديد العناصر من الواجهة
const inputText = document.getElementById('input');
const extractBtn = document.getElementById('extractButton');
const statusBox = document.getElementById('statusBox');
const tagsBox = document.getElementById('tagsBox');
const foodsBox = document.getElementById('foodsBox');
const drinksBox = document.getElementById('drinksBox');

// دالة مساعدة لتعبئة قائمة بعناصر على شكل badges
function fillList(listElement, items, className) {
    listElement.innerHTML = '';
    (items || []).forEach(item => {
        const li = document.createElement('li');
        li.className = className;
        li.textContent = item;
        listElement.appendChild(li);
    });
}

// 2. إضافة حدث عند الضغط على الزر
extractBtn.addEventListener('click', async () => {
    const text = inputText.value;

    // إذا كان المربع فاضي، ما في داعي نبعث طلب
    if (!text.trim()) return;

    // تغيير حالة الزر لـ "تحميل" أثناء الانتظار
    extractBtn.textContent = 'Extracting...';
    extractBtn.disabled = true;

    try {
        // 3. إرسال الطلب لـ FastAPI (السيرفر المحلي اللي شغال عليه الموديل)
        const response = await fetch('http://127.0.0.1:8000/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // إرسال النص بصيغة JSON تطابق الـ TextRequest بملف بايثون
            body: JSON.stringify({ text: text })
        });

        // تحويل الرد إلى JSON
        const data = await response.json();

        // إذا رجع السيرفر خطأ بمعالجة مخرجات الموديل
        if (data.error) {
            console.error("Server error:", data);
            statusBox.innerHTML = '<span style="color: #ef4444;">' + data.error + '</span>';
            fillList(tagsBox, [], '');
            fillList(foodsBox, [], '');
            fillList(drinksBox, [], '');
            return;
        }

        // 4. عرض النتائج على الواجهة

        // عرض حالة الطعام (السيرفر برجع food_or_drink كـ boolean)
        statusBox.innerHTML = data.food_or_drink ?
            '<span style="color: #10b981;">Food Content 🍕</span>' :
            '<span style="color: #ef4444;">Non-Food Content 🚫</span>';

        // عرض التاغات والأطعمة والمشروبات (السيرفر برجعهم كمصفوفات)
        fillList(tagsBox, data.tags, 'tag-badge');
        fillList(foodsBox, data.foods, 'item-badge');
        fillList(drinksBox, data.drinks, 'item-badge');

    } catch (error) {
        console.error("Error:", error);
        statusBox.innerHTML = '<span style="color: #ef4444;">Error connecting to server!</span>';
    } finally {
        // إرجاع الزر لحالته الطبيعية بعد انتهاء العملية
        extractBtn.textContent = 'Extract';
        extractBtn.disabled = false;
    }
});
