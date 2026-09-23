/* =====================================================
   NOVA STOCK V2
   Gestion complète :
   Produits + Photos + Stock + Ventes + Panier
   Rapports + Paramètres + Sauvegarde locale
===================================================== */


/* =========================
   DONNÉES
========================= */

let products =
    JSON.parse(
        localStorage.getItem("nova_products")
    ) || [];

let sales =
    JSON.parse(
        localStorage.getItem("nova_sales")
    ) || [];

let settings =
    JSON.parse(
        localStorage.getItem("nova_settings")
    ) || {
        shopName: "Ma boutique"
    };

let cart = [];

let currentSalesFilter = "all";

let currentProductImage = "";


/* =========================
   OUTILS
========================= */

function $(id) {
    return document.getElementById(id);
}


function money(number) {

    return Number(number || 0)
        .toLocaleString("fr-FR") + " F";

}


function generateId() {

    return Date.now().toString()
        +
        Math.random()
            .toString(36)
            .substring(2);

}


function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


function formatTime(date) {

    return new Date(date)
        .toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =========================
   SAUVEGARDE
========================= */

function saveData() {

    localStorage.setItem(
        "nova_products",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "nova_sales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "nova_settings",
        JSON.stringify(settings)
    );

}


/* =========================
   MESSAGE
========================= */

function showMessage(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================
   INITIALISATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApp();

    }
);


function initializeApp() {

    updateDate();

    loadSettings();

    updateDashboard();

    renderProducts();

    renderSaleProducts();

    renderCart();

    renderSales();

    updateReports();

}


/* =========================
   DATE
========================= */

function updateDate() {

    const element = $("dateToday");

    if (!element) return;

    element.textContent =
        new Date().toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

}


/* =========================
   NAVIGATION
========================= */

function navigate(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const selected = $(page);

    if (!selected) return;

    selected.classList.add("active");


    document
        .querySelectorAll(".navigation button")
        .forEach(button => {

            button.classList.remove(
                "active-nav"
            );

        });


    const navButton =
        document.querySelector(
            `.navigation button[onclick="navigate('${page}')"]`
        );

    if (navButton) {

        navButton.classList.add(
            "active-nav"
        );

    }


    if (page === "home") {

        updateDashboard();

    }

    if (page === "products") {

        renderProducts();

    }

    if (page === "sale") {

        renderSaleProducts();

        renderCart();

    }

    if (page === "sales") {

        renderSales();

    }

    if (page === "reports") {

        updateReports();

    }

    if (page === "settings") {

        loadSettings();

    }


    window.scrollTo(
        0,
        0
    );

}


/* =====================================================
   PRODUITS
===================================================== */


/* =========================
   OUVRIR MODAL PRODUIT
========================= */

function openProductModal(
    productId = ""
) {

    const product =
        products.find(
            p => p.id === productId
        );


    $("productModalTitle")
        .textContent =
        product
            ? "Modifier le produit"
            : "Nouveau produit";


    $("productId").value =
        productId;


    $("productName").value =
        product
            ? product.name
            : "";


    $("productCategory").value =
        product
            ? product.category
            : "";


    $("purchasePrice").value =
        product
            ? product.purchasePrice
            : "";


    $("sellingPrice").value =
        product
            ? product.sellingPrice
            : "";


    $("productStock").value =
        product
            ? product.stock
            : "";


    $("minimumStock").value =
        product
            ? product.minimumStock
            : 5;


    currentProductImage =
        product
            ? (product.image || "")
            : "";


    renderProductImagePreview(
        currentProductImage
    );


    const imageInput =
        $("productImage");

    if (imageInput) {

        imageInput.value = "";

    }


    openModal(
        "productModal"
    );

}


/* =========================
   SAUVEGARDER PRODUIT
========================= */

function saveProduct() {

    const productId =
        $("productId").value;


    const name =
        $("productName")
            .value
            .trim();


    const category =
        $("productCategory")
            .value
            .trim()
        ||
        "Sans catégorie";


    const purchasePrice =
        Number(
            $("purchasePrice").value
        );


    const sellingPrice =
        Number(
            $("sellingPrice").value
        );


    const stock =
        Number(
            $("productStock").value
        );


    const minimumStock =
        Number(
            $("minimumStock").value
        );


    if (!name) {

        showMessage(
            "Entrez le nom du produit."
        );

        return;

    }


    if (
        purchasePrice < 0 ||
        sellingPrice < 0 ||
        stock < 0 ||
        minimumStock < 0 ||
        Number.isNaN(purchasePrice) ||
        Number.isNaN(sellingPrice) ||
        Number.isNaN(stock) ||
        Number.isNaN(minimumStock)
    ) {

        showMessage(
            "Vérifiez les valeurs."
        );

        return;

    }


    if (productId) {

        const product =
            products.find(
                p => p.id === productId
            );


        if (!product) {

            showMessage(
                "Produit introuvable."
            );

            return;

        }


        product.name =
            name;

        product.category =
            category;

        product.purchasePrice =
            purchasePrice;

        product.sellingPrice =
            sellingPrice;

        product.stock =
            stock;

        product.minimumStock =
            minimumStock;

        product.image =
            currentProductImage;


        showMessage(
            "Produit modifié."
        );

    }

    else {

        products.push({

            id:
                generateId(),

            name:
                name,

            category:
                category,

            purchasePrice:
                purchasePrice,

            sellingPrice:
                sellingPrice,

            stock:
                stock,

            minimumStock:
                minimumStock,

            image:
                currentProductImage,

            createdAt:
                new Date()
                    .toISOString()

        });


        showMessage(
            "Produit ajouté."
        );

    }


    saveData();


    closeModal(
        "productModal"
    );


    renderProducts();

    renderSaleProducts();

    updateDashboard();

}


/* =========================
   PHOTO PRODUIT
========================= */

function previewProductImage(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showMessage(
            "Veuillez choisir une image."
        );

        return;

    }


    /*
       Limite volontaire :
       2 Mo maximum
    */

    if (
        file.size >
        2 * 1024 * 1024
    ) {

        showMessage(
            "Image trop lourde. Maximum 2 Mo."
        );

        event.target.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            currentProductImage =
                e.target.result;


            renderProductImagePreview(
                currentProductImage
            );

        };


    reader.readAsDataURL(file);

}


function renderProductImagePreview(
    image
) {

    const preview =
        $("productImagePreview");


    if (!preview) return;


    if (!image) {

        preview.innerHTML =
            "📦";

        return;

    }


    preview.innerHTML = `

        <img
            src="${image}"
            alt="Photo du produit">

    `;

}


function removeProductImage() {

    currentProductImage = "";


    renderProductImagePreview(
        ""
    );


    const input =
        $("productImage");


    if (input) {

        input.value = "";

    }


    showMessage(
        "Photo supprimée."
    );

}


/* =========================
   AFFICHER PRODUITS
========================= */

function renderProducts() {

    const container =
        $("productsList");


    if (!container) return;


    const searchInput =
        $("productSearch");


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        products.filter(
            product => {

                return (

                    product.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    product.category
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="glyph">
                    📦
                </div>

                <p>
                    Aucun produit trouvé.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(
            product => {

                const low =
                    product.stock <=
                    product.minimumStock;


                const initials =
                    product.name
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                const image =
                    product.image
                        ? `
                            <img
                                src="${product.image}"
                                alt="${escapeHTML(product.name)}"
                                style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                                border-radius:inherit;
                                "
                            >
                        `
                        : initials;


                return `

                    <div class="product-row">

                        <div class="product-avatar">

                            ${image}

                        </div>


                        <div class="product-info">

                            <h4>

                                <span
                                    class="name-trunc">

                                    ${escapeHTML(
                                        product.name
                                    )}

                                </span>

                            </h4>


                            <div class="meta">

                                <span class="tag">

                                    ${escapeHTML(
                                        product.category
                                    )}

                                </span>

                                <span
                                    class="${
                                        low
                                            ? "stock-low"
                                            : ""
                                    }">

                                    Stock :
                                    ${product.stock}

                                </span>

                            </div>

                        </div>


                        <div class="product-price">

                            <strong>

                                ${money(
                                    product.sellingPrice
                                )}

                            </strong>


                            <span class="stockqty">

                                ${
                                    low
                                        ? "⚠️ Stock faible"
                                        : "Stock OK"
                                }

                            </span>

                        </div>


                        <div class="product-actions">

                            <button
                                class="icon-btn"
                                onclick="
                                openProductModal(
                                    '${product.id}'
                                )">

                                ✏️

                            </button>


                            <button
                                class="icon-btn danger"
                                onclick="
                                deleteProduct(
                                    '${product.id}'
                                )">

                                🗑️

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================
   SUPPRIMER PRODUIT
========================= */

function deleteProduct(
    productId
) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    if (
        !confirm(
            `Supprimer "${product.name}" ?`
        )
    ) {

        return;

    }


    products =
        products.filter(
            p => p.id !== productId
        );


    cart =
        cart.filter(
            item =>
                item.productId !==
                productId
        );


    saveData();


    renderProducts();

    renderSaleProducts();

    renderCart();

    updateDashboard();


    showMessage(
        "Produit supprimé."
    );

}


/* =====================================================
   VENTE
===================================================== */


/* =========================
   PRODUITS POUR VENTE
========================= */

function renderSaleProducts() {

    const container =
        $("saleProducts");


    if (!container) return;


    const searchInput =
        $("saleSearch");


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        products.filter(
            product => {

                return (

                    product.stock > 0

                    &&

                    (

                        product.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.category
                            .toLowerCase()
                            .includes(search)

                    )

                );

            }
        );


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="glyph">
                    📦
                </div>

                <p>
                    Aucun produit disponible.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(
            product => {

                const initials =
                    product.name
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                const image =
                    product.image
                        ? `
                            <img
                                src="${product.image}"
                                alt="${escapeHTML(product.name)}"
                                style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                                border-radius:inherit;
                                "
                            >
                        `
                        : initials;


                const cartItem =
                    cart.find(
                        item =>
                            item.productId ===
                            product.id
                    );


                const quantity =
                    cartItem
                        ? cartItem.quantity
                        : 0;


                return `

                    <div
                        class="product-row selectable"
                        onclick="
                        addToCart(
                            '${product.id}'
                        )">

                        <div class="product-avatar">

                            ${image}

                        </div>


                        <div class="product-info">

                            <h4>

                                <span
                                    class="name-trunc">

                                    ${escapeHTML(
                                        product.name
                                    )}

                                </span>

                            </h4>


                            <div class="meta">

                                <span class="tag">

                                    ${escapeHTML(
                                        product.category
                                    )}

                                </span>

                                <span>

                                    Stock :
                                    ${product.stock}

                                </span>

                            </div>

                        </div>


                        <div class="product-price">

                            <strong>

                                ${money(
                                    product.sellingPrice
                                )}

                            </strong>


                            ${
                                quantity > 0
                                    ? `
                                    <div
                                        class="qty-stepper"
                                        onclick="
                                        event.stopPropagation();">

                                        <button
                                            onclick="
                                            changeQuantity(
                                                '${product.id}',
                                                -1
                                            )">

                                            −

                                        </button>

                                        <span>

                                            ${quantity}

                                        </span>

                                        <button
                                            onclick="
                                            changeQuantity(
                                                '${product.id}',
                                                1
                                            )">

                                            +

                                        </button>

                                    </div>
                                    `
                                    : `
                                    <span
                                        class="stockqty">

                                        ＋ Ajouter

                                    </span>
                                    `
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================
   AJOUTER AU PANIER
========================= */

function addToCart(
    productId
) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    const item =
        cart.find(
            i =>
                i.productId ===
                productId
        );


    if (item) {

        if (
            item.quantity >=
            product.stock
        ) {

            showMessage(
                "Stock insuffisant."
            );

            return;

        }


        item.quantity++;

    }

    else {

        cart.push({

            productId:
                productId,

            quantity:
                1

        });

    }


    renderCart();

    renderSaleProducts();


    showMessage(
        "Produit ajouté."
    );

}


/* =========================
   QUANTITÉ PANIER
========================= */

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            i =>
                i.productId ===
                productId
        );


    const product =
        products.find(
            p =>
                p.id ===
                productId
        );


    if (
        !item ||
        !product
    ) {

        return;

    }


    item.quantity +=
        amount;


    if (
        item.quantity >
        product.stock
    ) {

        item.quantity =
            product.stock;

    }


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                i =>
                    i.productId !==
                    productId
            );

    }


    renderCart();

    renderSaleProducts();

}


/* =========================
   VIDER PANIER
========================= */

function clearCart() {

    if (!cart.length) {

        return;

    }


    cart = [];

    renderCart();

    renderSaleProducts();


    showMessage(
        "Panier vidé."
    );

}


/* =========================
   TOTAL PANIER
========================= */

function getCartTotal() {

    let total = 0;


    cart.forEach(
        item => {

            const product =
                products.find(
                    p =>
                        p.id ===
                        item.productId
                );


            if (product) {

                total +=
                    product.sellingPrice *
                    item.quantity;

            }

        }
    );


    return total;

}


/* =========================
   AFFICHER PANIER
========================= */

function renderCart() {

    const container =
        $("cartList");


    if (!container) return;


    const total =
        getCartTotal();


    const totalElement =
        $("cartTotal");


    if (totalElement) {

        totalElement.textContent =
            money(total);

    }


    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const countElement =
        $("cartCount");


    if (countElement) {

        countElement.textContent =
            count +
            (
                count > 1
                    ? " articles"
                    : " article"
            );

    }


    if (!cart.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="glyph">
                    🛒
                </div>

                <p>
                    Le panier est vide.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        cart.map(
            item => {

                const product =
                    products.find(
                        p =>
                            p.id ===
                            item.productId
                    );


                if (!product) return "";


                return `

                    <div class="cart-item">

                        <div class="name">

                            <span
                                class="name-trunc">

                                ${escapeHTML(
                                    product.name
                                )}

                            </span>

                        </div>


                        <div
                            class="qty-stepper">

                            <button
                                onclick="
                                changeQuantity(
                                    '${product.id}',
                                    -1
                                )">

                                −

                            </button>


                            <span>

                                ${item.quantity}

                            </span>


                            <button
                                onclick="
                                changeQuantity(
                                    '${product.id}',
                                    1
                                )">

                                +

                            </button>

                        </div>


                        <div
                            class="line-total">

                            ${money(
                                product.sellingPrice *
                                item.quantity
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   PAIEMENT
===================================================== */


/* =========================
   OUVRIR PAIEMENT
========================= */

function openPayment() {

    if (!cart.length) {

        showMessage(
            "Ajoutez un produit au panier."
        );

        return;

    }


    $("paymentTotal")
        .textContent =
        money(
            getCartTotal()
        );


    openModal(
        "paymentModal"
    );

}


/* =========================
   FINALISER VENTE
========================= */

function completeSale(
    paymentMethod
) {

    if (!cart.length) {

        return;

    }


    /* Vérification stock */

    for (
        const item of cart
    ) {

        const product =
            products.find(
                p =>
                    p.id ===
                    item.productId
            );


        if (
            !product ||
            product.stock <
            item.quantity
        ) {

            showMessage(
                "Stock insuffisant."
            );

            return;

        }

    }


    let totalCost = 0;


    const items =
        cart.map(
            item => {

                const product =
                    products.find(
                        p =>
                            p.id ===
                            item.productId
                    );


                product.stock -=
                    item.quantity;


                totalCost +=
                    product.purchasePrice *
                    item.quantity;


                return {

                    productId:
                        product.id,

                    name:
                        product.name,

                    quantity:
                        item.quantity,

                    purchasePrice:
                        product.purchasePrice,

                    sellingPrice:
                        product.sellingPrice

                };

            }
        );


    const total =
        getCartTotal();


    const sale = {

        id:
            generateId(),

        date:
            new Date()
                .toISOString(),

        items:
            items,

        total:
            total,

        cost:
            totalCost,

        profit:
            total - totalCost,

        paymentMethod:
            paymentMethod

    };


    sales.unshift(
        sale
    );


    cart = [];


    saveData();


    closeModal(
        "paymentModal"
    );


    renderCart();

    renderSaleProducts();

    renderSales();

    updateDashboard();

    updateReports();


    showMessage(
        "Vente enregistrée avec succès."
    );


    navigate(
        "home"
    );

}


/* =====================================================
   VENTES
===================================================== */


/* =========================
   VENTES DU JOUR
========================= */

function getTodaySales() {

    const today =
        new Date()
            .toDateString();


    return sales.filter(
        sale =>
            new Date(
                sale.date
            ).toDateString()
            ===
            today
    );

}


/* =========================
   FILTRE VENTES
========================= */

function salesFilter(
    filter
) {

    currentSalesFilter =
        filter;


    const all =
        $("allSales");

    const today =
        $("todaySalesFilter");


    if (all) {

        all.classList.toggle(
            "active",
            filter === "all"
        );

    }


    if (today) {

        today.classList.toggle(
            "active",
            filter === "today"
        );

    }


    renderSales();

}


/* =========================
   AFFICHER VENTES
========================= */

function renderSales() {

    const container =
        $("salesList");


    if (!container) return;


    let list =
        [...sales];


    if (
        currentSalesFilter ===
        "today"
    ) {

        list =
            getTodaySales();

    }


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="glyph">
                    💰
                </div>

                <p>
                    Aucune vente.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        list.map(
            sale => {

                const itemNames =
                    sale.items
                        .map(
                            item =>
                                `${item.name} ×${item.quantity}`
                        )
                        .join(", ");


                const methodClass =
                    sale.paymentMethod ===
                    "Crédit"
                        ? "credit"
                        : "";


                return `

                    <div class="sale-row">

                        <div
                            class="sale-meta">

                            <div class="items">

                                ${escapeHTML(
                                    itemNames
                                )}

                            </div>


                            <div class="when">

                                ${formatDate(
                                    sale.date
                                )}

                                ${formatTime(
                                    sale.date
                                )}

                                <span
                                    class="method
                                    ${methodClass}">

                                    ${escapeHTML(
                                        sale.paymentMethod
                                    )}

                                </span>

                            </div>

                        </div>


                        <strong>

                            ${money(
                                sale.total
                            )}

                        </strong>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   TABLEAU DE BORD
===================================================== */

function updateDashboard() {

    const todaySales =
        getTodaySales();


    const totalSales =
        todaySales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.total || 0
                ),
            0
        );


    const totalProfit =
        todaySales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.profit || 0
                ),
            0
        );


    const lowStock =
        products.filter(
            product =>
                product.stock <=
                product.minimumStock
        );


    const todaySalesElement =
        $("todaySales");

    const productCountElement =
        $("productCount");

    const todayProfitElement =
        $("todayProfit");

    const lowStockCountElement =
        $("lowStockCount");


    if (todaySalesElement) {

        todaySalesElement.textContent =
            money(totalSales);

    }


    if (productCountElement) {

        productCountElement.textContent =
            products.length;

    }


    if (todayProfitElement) {

        todayProfitElement.textContent =
            money(totalProfit);

    }


    if (lowStockCountElement) {

        lowStockCountElement.textContent =
            lowStock.length;

    }


    renderLowStock();

}


/* =========================
   STOCK FAIBLE
========================= */

function renderLowStock() {

    const container =
        $("lowStockList");


    if (!container) return;


    const lowStock =
        products.filter(
            product =>
                product.stock <=
                product.minimumStock
        );


    if (!lowStock.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="glyph">
                    ✅
                </div>

                <p>
                    Aucun produit en stock faible.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        lowStock
            .slice(0, 5)
            .map(
                product => `

                    <div class="product-row">

                        <div class="product-avatar">

                            ${
                                product.image
                                    ? `
                                    <img
                                        src="${product.image}"
                                        alt=""
                                        style="
                                        width:100%;
                                        height:100%;
                                        object-fit:cover;
                                        border-radius:inherit;
                                        "
                                    >
                                    `
                                    :
                                    "⚠️"
                            }

                        </div>


                        <div class="product-info">

                            <h4>

                                <span
                                    class="name-trunc">

                                    ${escapeHTML(
                                        product.name
                                    )}

                                </span>

                            </h4>


                            <div class="meta">

                                <span
                                    class="stock-low">

                                    Stock :
                                    ${product.stock}

                                </span>

                            </div>

                        </div>


                        <div class="product-price">

                            <strong>

                                ${money(
                                    product.sellingPrice
                                )}

                            </strong>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =====================================================
   RAPPORTS
===================================================== */

function updateReports() {

    const totalSales =
        sales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.total || 0
                ),
            0
        );


    const totalCost =
        sales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.cost || 0
                ),
            0
        );


    const totalProfit =
        sales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.profit || 0
                ),
            0
        );


    const salesElement =
        $("reportSales");

    const costElement =
        $("reportCost");

    const profitElement =
        $("reportProfit");

    const countElement =
        $("reportSaleCount");


    if (salesElement) {

        salesElement.textContent =
            money(totalSales);

    }


    if (costElement) {

        costElement.textContent =
            money(totalCost);

    }


    if (profitElement) {

        profitElement.textContent =
            money(totalProfit);

    }


    if (countElement) {

        countElement.textContent =
            sales.length;

    }


    updateBestProduct();

}


/* =========================
   MEILLEUR PRODUIT
========================= */

function updateBestProduct() {

    const element =
        $("bestProduct");


    if (!element) return;


    if (!sales.length) {

        element.innerHTML =
            "Aucune vente.";

        return;

    }


    const quantities = {};


    sales.forEach(
        sale => {

            sale.items.forEach(
                item => {

                    if (
                        !quantities[
                            item.productId
                        ]
                    ) {

                        quantities[
                            item.productId
                        ] = {

                            name:
                                item.name,

                            quantity:
                                0

                        };

                    }


                    quantities[
                        item.productId
                    ].quantity +=
                        item.quantity;

                }
            );

        }
    );


    const best =
        Object.values(
            quantities
        ).sort(
            (a, b) =>
                b.quantity -
                a.quantity
        )[0];


    if (!best) {

        element.innerHTML =
            "Aucune vente.";

        return;

    }


    element.innerHTML = `

        ${escapeHTML(best.name)}

        <span class="sub">

            ${best.quantity}
            unité(s) vendue(s)

        </span>

    `;

}


/* =====================================================
   PARAMÈTRES
===================================================== */

function loadSettings() {

    const input =
        $("shopNameInput");


    const shopName =
        settings.shopName ||
        "Ma boutique";


    const headerName =
        $("shopName");


    if (headerName) {

        headerName.textContent =
            shopName;

    }


    if (input) {

        input.value =
            shopName;

    }

}


/* =========================
   ENREGISTRER PARAMÈTRES
========================= */

function saveSettings() {

    const input =
        $("shopNameInput");


    if (!input) return;


    const name =
        input.value.trim();


    settings.shopName =
        name ||
        "Ma boutique";


    saveData();

    loadSettings();


    showMessage(
        "Paramètres enregistrés."
    );

}


/* =====================================================
   EXPORT
===================================================== */

function exportData() {

    const data = {

        products:
            products,

        sales:
            sales,

        settings:
            settings,

        exportedAt:
            new Date()
                .toISOString()

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "nova-stock-sauvegarde.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showMessage(
        "Sauvegarde exportée."
    );

}


/* =====================================================
   SUPPRESSION DES DONNÉES
===================================================== */

function deleteAllData() {

    const confirmation =
        confirm(
            "Attention : toutes les données de NOVA STOCK seront supprimées. Continuer ?"
        );


    if (!confirmation) {

        return;

    }


    products = [];

    sales = [];

    cart = [];


    settings = {

        shopName:
            "Ma boutique"

    };


    saveData();


    currentProductImage = "";


    renderProducts();

    renderSaleProducts();

    renderCart();

    renderSales();

    updateDashboard();

    updateReports();

    loadSettings();


    showMessage(
        "Toutes les données ont été supprimées."
    );

}


/* =====================================================
   MODALS
===================================================== */

function openModal(
    modalId
) {

    const modal =
        $(modalId);


    if (!modal) return;


    modal.classList.add(
        "open"
    );

}


function closeModal(
    modalId
) {

    const modal =
        $(modalId);


    if (!modal) return;


    modal.classList.remove(
        "open"
    );

}


/* =========================
   FERMER MODAL EN CLIQUANT
   SUR L'ARRIÈRE-PLAN
========================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList
                .contains("modal")
        ) {

            event.target.classList
                .remove("open");

        }

    }
);


/* =====================================================
   RAPPORT À PARTAGER
===================================================== */

function shareReport() {

    const totalSales =
        sales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.total || 0
                ),
            0
        );


    const totalProfit =
        sales.reduce(
            (sum, sale) =>
                sum + Number(
                    sale.profit || 0
                ),
            0
        );


    const text =

        `📊 NOVA STOCK

` +
        `Boutique : ${
            settings.shopName ||
            "Ma boutique"
        }

` +
        `💰 Ventes : ${
            money(totalSales)
        }

` +
        `📈 Bénéfice : ${
            money(totalProfit)
        }

` +
        `🧾 Nombre de ventes : ${
            sales.length
        }`;


    if (
        navigator.share
    ) {

        navigator.share({

            title:
                "Rapport NOVA STOCK",

            text:
                text

        })
        .catch(
            () => {}
        );

        return;

    }


    if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(text)
            .then(
                () => {

                    showMessage(
                        "Rapport copié."
                    );

                }
            )
            .catch(
                () => {

                    showMessage(
                        "Impossible de copier le rapport."
                    );

                }
            );

        return;

    }


    alert(text);

}


/* =====================================================
   FIN NOVA STOCK V2
===================================================== */