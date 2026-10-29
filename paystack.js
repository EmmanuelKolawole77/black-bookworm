import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { app, database } from "./cart.js"


const auth = getAuth(app)

let currentUser = null
const cart = JSON.parse(localStorage.getItem("cart"))

const updateProductQuantity = async () => {
    cart.forEach(async ({key, quantity}) => {        
        const reference = ref(database, `products/${key}`)

        const snapshot = await get(reference);
        const productData = snapshot.val()
        if (!productData) {
            console.warn("Product not found,: ", key)
            return;
        }
        let productQuantity = productData.quantity
        productQuantity -= quantity
        
        if (productQuantity < 0) {
            productQuantity = 0;
        }
        await update(reference, {quantity: productQuantity})                        
    })
}
window.updateProductQuantity = updateProductQuantity

const getAuthenticatedEmail = () => new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()

        if (user?.email) {
            currentUser = user
            resolve(user.email)
        } else {
            reject(new Error("You must be signed in to checkout."))
        }
    })
})

const payWithPayStack = async (event) => {
    event.preventDefault()

    let email
    try {
        email = await getAuthenticatedEmail()
    } catch (error) {
        alert(error.message)
        return
    }

    const amount = renderCart() * 100
    const handler = PaystackPop.setup({
        key: 'pk_test_b203234ed4a6cb09f84b8c78c6be92f691174884',
        email,
        amount,
        currency: 'NGN',


        callback: function (response) {
            // This runs after a successful payment
            alert('Payment successful! Reference: ' + response.reference);

            // Send response.reference to your backend server to verify the transaction
            verifyPaymentOnBackend(response.reference);
            localStorage.clear()
            updateProductQuantity()
            renderCart()
        },
        onClose: function () {
            // This runs if the user closes the payment window manually
            alert('Transaction was not completed.');
            console.log(email);
            console.log(amount);
        }

    });
    handler.openIframe();
}
window.payWithPayStack = payWithPayStack

function verifyPaymentOnBackend(reference) {
    // Real security happens on the backend. 
    // Make a fetch call to your server to verify this reference using Paystack's Verification API.
    console.log("Verifying reference...", reference);
}

// CART UPDATE AFTER PURCHASE