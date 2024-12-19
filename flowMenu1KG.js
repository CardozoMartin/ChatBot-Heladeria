const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const path = require("path");
const fs = require("fs");
const sabores = path.join(__dirname, "messages", "menuSabores.txt");
const menuSabores = fs.readFileSync(sabores, "utf-8");
const flowMenu1KG = addKeyword(EVENTS.ACTION)
    .addAnswer(menuSabores, { capture: true }, async (ctx, { flowDynamic }) => {

        DatosDelPedido.sabores = ctx.body.split(',').slice(0, 3); // Tomar hasta 3 sabores
        await flowDynamic(`✅ *Sabores seleccionados:* ${DatosDelPedido.sabores.join(', ')}`);
    })
    .addAnswer("🙋‍♂️ *Por favor, indícanos tu nombre y apellido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.nombre = ctx.body;
        await flowDynamic(`📝 *Nombre registrado:* ${ctx.body}`);
    })
    .addAnswer("🏠 *Escribe la dirección a la que deseas que enviemos tu pedido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.direccion = ctx.body;
        await flowDynamic(`📍 *Dirección confirmada:* ${ctx.body}`);
    })
    .addAnswer("✅ *Si estás listo para confirmar tu pedido, escribe:* _'Sí', 'Ok' o 'Aceptar'._ o para cancelar: 'No'", { capture: true }, async (ctx, { flowDynamic }) => {
        const res = ctx.body.toLowerCase();
        if (res.includes("sí") || res.includes("ok") || res.includes("aceptar")) {
            const { nombre, direccion, sabores, precio, nombreProducto } = DatosDelPedido;
            await flowDynamic(`📦 *Detalles del Pedido:*  
            👤 *Nombre:* ${nombre}  
            📍 *Dirección:* ${direccion} 
            📝 *Producto seleccionado:* ${nombreProducto}
            🍦 *Sabores seleccionados:* ${sabores.join(', ')}
             $  *Precio:* ${precio}`);
            await flowDynamic("🎉 *¡Gracias por tu pedido! Estará en camino muy pronto. 🛵💨*");
        } else if (res.includes("No") || res.includes("no")) {
            await flowDynamic("❌ *Haz cancelado el pedido! 🌟");
            return;
        } else {
            await flowDynamic("⚠️ *Respuesta no válida.* Por favor, vuelve a intentarlo más tarde.");
            return;
        }
    });

module.exports = { flowMenu1KG };
