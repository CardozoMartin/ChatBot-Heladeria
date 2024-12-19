const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const { flowMenu1KG } = require('./flowMenu1KG');  // Asegúrate de importar los flujos correctamente
const path = require("path");
const fs = require("fs");

// Leer los menús desde archivos de texto


const Productos = path.join(__dirname, "messages", "menuProductos.txt");
const menuProduct = fs.readFileSync(Productos, "utf-8");
// Flujo para seleccionar productos
const menuProductos = addKeyword(EVENTS.ACTION)
    .addAnswer("🍨 *¿Qué producto deseas ordenar hoy?*")
    .addAnswer(menuProduct, { capture: true }, async (ctx, { gotoFlow, flowDynamic }) => {
        const opcionesValidas = ["1", "2", "3", "4", "5"];
        const res = ctx.body;
        if (res === "1") {
            DatosDelPedido.precio = 10000
            DatosDelPedido.nombreProducto = "1 KG de Helado"
        } else if (res === "2") {
            DatosDelPedido.precio = 5500
            DatosDelPedido.nombreProducto = "1/2 KG de Helado"
        } else if (res === 3) {
            DatosDelPedido.precio = 3000
            DatosDelPedido.nombreProducto = "1/4 KG de Helado"
        }
        if (!opcionesValidas.includes(ctx.body)) {
            return fallbBack("⚠️ *Opción no válida.* Por favor, elige un número del menú.");
        }

        switch (ctx.body) {
            case "1":
            case "2":
            case "3":
                return gotoFlow(flowMenu1KG);  // Llama al flujo de selección de sabores

            case "4":
                return await flowDynamic("📦 *Has seleccionado una caja de helados.*");

            case "5":
                return await flowDynamic("🎂 *Has seleccionado una torta helada.*");

            default:
                await flowDynamic("❌ *Opción no válida. Por favor, selecciona una opción del menú.*");
                break;
        }
    });

module.exports = menuProductos;
