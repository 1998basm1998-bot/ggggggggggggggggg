// تكوين النظام الأساسي
const app = {
    // جلب البيانات المخزنة أو إنشاء مصفوفة فارغة
    db: JSON.parse(localStorage.getItem('car_debts_sys')) || [],
    
    // إعدادات الدخول
    secretCode: "1234",

    // دالة التحقق من الرمز السري
    checkAccess: function() {
        const input = document.getElementById('passcode');
        const msg = document.getElementById('login-msg');
        
        if(input.value === this.secretCode) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            this.renderDebts();
            this.showToast('تم تسجيل الدخول بنجاح');
        } else {
            msg.innerText = "⚠️ الرمز السري غير صحيح";
            input.value = "";
            input.focus();
            setTimeout(() => msg.innerText = "", 2000);
        }
    },

    // دالة حفظ البيانات الجديدة
    saveDebt: function() {
        const name = document.getElementById('cust-name').value.trim();
        const car = document.getElementById('car-detail').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const total = document.getElementById('total-amount').value;
        const paid = document.getElementById('paid-amount').value || 0;
        const currency = document.getElementById('currency').value;

        // التحقق من الحقول الفارغة
        if(!name || !total) {
            this.showToast('يرجى ملء اسم الزبون والمبلغ', true);
            return;
        }

        const newEntry = {
            id: Date.now(),
            name: name,
            car: car || "غير محدد",
            phone: phone,
            total: parseFloat(total),
            paid: parseFloat(paid),
            currency: currency,
            date: new Date().toLocaleDateString('ar-IQ'),
            timestamp: Date.now()
        };

        // إضافة للسجل وحفظ في الذاكرة
        this.db.unshift(newEntry); // إضافة في البداية
        this.saveToStorage();
        
        // تنظيف الحقول وتحديث العرض
        this.clearInputs();
        this.renderDebts();
        this.showSection('list');
        this.showToast('تم حفظ السجل الجديد');
    },

    // دالة رسم البطاقات على الشاشة
    renderDebts: function() {
        const container = document.getElementById('debts-container');
        const emptyMsg = document.getElementById('empty-msg');
        
        container.innerHTML = "";

        if(this.db.length === 0) {
            emptyMsg.classList.remove('hidden');
            return;
        } else {
            emptyMsg.classList.add('hidden');
        }

        this.db.forEach((item, index) => {
            const remaining = item.total - item.paid;
            const currencySymbol = item.currency === 'IQD' ? 'د.ع' : '$';
            
            const cardHTML = `
                <div class="glass p-4 rounded-xl border-r-4 ${remaining > 0 ? 'border-red-500' : 'border-green-500'} card-anim" style="animation-delay: ${index * 0.05}s">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-bold text-lg text-slate-100">${item.name}</h4>
                            <div class="text-xs text-slate-400 mt-1">
                                <i class="fas fa-car ml-1"></i> ${item.car}
                            </div>
                        </div>
                        <button onclick="app.deleteDebt(${item.id})" class="text-slate-600 hover:text-red-400 p-2">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    
                    <div class="bg-slate-800/50 p-3 rounded-lg grid grid-cols-2 gap-2 text-center mt-2">
                        <div>
                            <div class="text-[10px] text-slate-400">الواصل</div>
                            <div class="text-green-400 font-mono font-bold">${item.paid.toLocaleString()} <span class="text-[10px]">${currencySymbol}</span></div>
                        </div>
                        <div>
                            <div class="text-[10px] text-slate-400">المتبقي</div>
                            <div class="text-red-400 font-mono font-bold">${remaining.toLocaleString()} <span class="text-[10px]">${currencySymbol}</span></div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mt-3 pt-2 border-t border-slate-700/50">
                        <span class="text-[10px] text-slate-500">${item.date}</span>
                        <a href="https://wa.me/${item.phone}" target="_blank" class="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded hover:bg-green-600 hover:text-white transition">
                            <i class="fab fa-whatsapp ml-1"></i> مراسلة
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    },

    // دالة الحذف
    deleteDebt: function(id) {
        if(confirm("هل أنت متأكد من حذف هذا السجل نهائياً؟")) {
            this.db = this.db.filter(item => item.id !== id);
            this.saveToStorage();
            this.renderDebts();
            this.showToast('تم حذف السجل');
        }
    },

    // أدوات مساعدة
    saveToStorage: function() {
        localStorage.setItem('car_debts_sys', JSON.stringify(this.db));
    },

    clearInputs: function() {
        document.getElementById('cust-name').value = "";
        document.getElementById('car-detail').value = "";
        document.getElementById('cust-phone').value = "";
        document.getElementById('total-amount').value = "";
        document.getElementById('paid-amount').value = "";
    },

    showSection: function(sectionId) {
        document.getElementById('add-section').classList.toggle('hidden', sectionId !== 'add');
        document.getElementById('list-section').classList.toggle('hidden', sectionId !== 'list');
    },

    showToast: function(message, isError = false) {
        const toast = document.getElementById('toast');
        const msgSpan = document.getElementById('toast-msg');
        
        msgSpan.innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        if(isError) {
            toast.querySelector('i').className = "fas fa-exclamation-circle text-red-500";
        } else {
            toast.querySelector('i').className = "fas fa-check-circle text-green-500";
        }

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    },

    exportData: function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.db));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "backup_debts_" + new Date().toLocaleDateString() + ".json");
        dlAnchorElem.click();
    },

    logout: function() {
        location.reload();
    }
};

// تشغيل التحقق عند الضغط على Enter
document.getElementById('passcode').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        app.checkAccess();
    }
});
