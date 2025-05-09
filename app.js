const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const path = require("path");
const fs = require("fs");

// Leer los menús desde archivos de texto
const menuPath = path.join(__dirname, "messages", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");

const Productos = path.join(__dirname, "messages", "menuProductos.txt");
const menuProductos = fs.readFileSync(Productos, "utf-8");

const sabores = path.join(__dirname, "messages", "menuSabores.txt");
const menuSabores = fs.readFileSync(sabores, "utf-8");

const saboresTrotas = path.join(__dirname, "messages","saboresTortaHelada.txt");
const menuTortas = fs.readFileSync(saboresTrotas,"utf-8")

const caja = path.join(__dirname,"messages","menuCajaDeHelados.txt")
const menuCajaDeHelados = fs.readFileSync(caja,"utf-8")

// Datos del pedido
let DatosDelPedido = {
    nombre: "",
    direccion: "",
    nombreProducto: "",
    precio: "",
    sabores: "",
    carrito: []
};

// Función para mostrar el carrito de compras
const mostrarCarrito = (ctx, { flowDynamic }) => {
    if (DatosDelPedido.carrito.length === 0) {
        return flowDynamic("🛒 *Tu carrito está vacío.* Por favor, selecciona productos para agregar al carrito.");
    }
    let carritoText = "🛒 *Tu carrito actual:*\n";
    let nombre = DatosDelPedido.nombre;
    let direccion = DatosDelPedido.direccion;

carritoText += `*Nombre:* ${nombre}\n *Direccion:*${direccion}\n\n`
    DatosDelPedido.carrito.forEach((item, index) => {
        carritoText += `${index + 1}. *Producto:* ${item.nombreProducto}\n *Sabores:* ${item.sabores}\n *Precio:* $${item.precio}\n\n`;
    });
    carritoText += `Total: $${DatosDelPedido.carrito.reduce((total, item) => total + item.precio, 0)}`;
    return flowDynamic(carritoText);
};

// Flujo para seleccionar los sabores
const flowMenu1KG = addKeyword(EVENTS.ACTION)
    .addAnswer(menuSabores, { capture: true }, async (ctx, { flowDynamic }) => {

        const ultimoProducto = DatosDelPedido.carrito[DatosDelPedido.carrito.length - 1];

        if (ultimoProducto) {
            ultimoProducto.sabores = ctx.body; // Asigna los sabores al último producto del carrito
            await flowDynamic(`✅ *Sabores seleccionados:* ${ctx.body}`);
        } else {
            await flowDynamic("⚠️ *No hay un producto en el carrito para agregar sabores.*");
        }
    })
    .addAnswer("¿Deseas agregar más productos al carrito? 'Si' para agregar otro producto 'No' Para seguir y terminar el pedido",{capture:true}, async(ctx,{flowDynamic,fallbBack,gotoFlow})=>{
        const res = ctx.body.toLowerCase();
        if (res.includes("si") || res.includes("Si")) {
            
            return gotoFlow(flowMenuProductos);
        } 
    })
    .addAnswer("🙋‍♂️ *Por favor, indícanos tu nombre y apellido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.nombre = ctx.body;
        await flowDynamic(`📝 *Nombre registrado:* ${ctx.body}`);
    })
    .addAnswer("🏠 *Escribe la dirección a la que deseas que enviemos tu pedido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.direccion = ctx.body;
        await flowDynamic(`📍 *Dirección confirmada:* ${ctx.body}`);
    })
    .addAnswer("✅ *Si estás listo para confirmar tu pedido, escribe:* _'Sí', 'Ok' o 'Aceptar'._ o para cancelar: 'No'.", { capture: true }, async (ctx, { flowDynamic }) => {
        const res = ctx.body.toLowerCase();
        if (res.includes("sí") || res.includes("ok") || res.includes("aceptar") || res.includes("si") || res.includes("Si") || res.includes("Sí")) {
            await mostrarCarrito(ctx, { flowDynamic });
            await flowDynamic("🎉 *¡Gracias por tu pedido! Está en proceso y será enviado a la brevedad. 🛵💨*");
            await flowDynamic("❌ *Si deseas cancelar tu pedido, simplemente escribe:* _'Cancelar'_.");
            DatosDelPedido = {
                nombre: "",
                direccion: "",
                nombreProducto: "",
                precio: "",
                sabores: [],
                carrito: []
            };
        } else if (res.includes("no") || res.includes("No")) {
            await flowDynamic("❌ *Haz cancelado el pedido! 🌟");
        } else {
            await flowDynamic("⚠️ *Respuesta no válida.* Por favor, vuelve a intentarlo más tarde.");
        }
    })
    

// Flujo para cancelar un pedido
const flowCancelar = addKeyword(['Cancelar', 'cancelar', 'cancel'])
    .addAnswer("❌ *Tu pedido ha sido cancelado exitosamente.* ¡Esperamos verte de nuevo pronto! 🌟");

// Flujo para Caja de Helado Palito
const flowCajaHeladoPalito = addKeyword(EVENTS.ACTION)
    .addAnswer("🛒 *Has seleccionado Caja de Helado Palito.*")
    .addAnswer(menuCajaDeHelados, { capture: true }, async (ctx, { flowDynamic }) => {

        const ultimoProducto = DatosDelPedido.carrito[DatosDelPedido.carrito.length - 1];

        if (ultimoProducto) {
            ultimoProducto.sabores = ctx.body; // Asigna los sabores al último producto del carrito
            await flowDynamic(`✅ *Sabores seleccionados:* ${ctx.body}`);
        } else {
            await flowDynamic("⚠️ *No hay un producto en el carrito para agregar sabores.*");
        }
    })
    .addAnswer("¿Deseas agregar más productos al carrito? 'Si' para agregar otro producto 'No' Para seguir y terminar el pedido",{capture:true}, async(ctx,{flowDynamic,fallbBack,gotoFlow})=>{
        const res = ctx.body.toLowerCase();
        if (res.includes("si") || res.includes("Si")) {
            
            return gotoFlow(flowMenuProductos);
        } 
    })
    .addAnswer("🙋‍♂️ *Por favor, indícanos tu nombre y apellido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.nombre = ctx.body;
        await flowDynamic(`📝 *Nombre registrado:* ${ctx.body}`);
    })
    .addAnswer("🏠 *Escribe la dirección a la que deseas que enviemos tu pedido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.direccion = ctx.body;
        await flowDynamic(`📍 *Dirección confirmada:* ${ctx.body}`);
    })
    .addAnswer("✅ *Si estás listo para confirmar tu pedido, escribe:* _'Sí', 'Ok' o 'Aceptar'._ o para cancelar: 'No'.", { capture: true }, async (ctx, { flowDynamic }) => {
        const res = ctx.body.toLowerCase();
        if (res.includes("sí") || res.includes("ok") || res.includes("aceptar") || res.includes("si") || res.includes("Si") || res.includes("Sí")) {
            await mostrarCarrito(ctx, { flowDynamic });
            await flowDynamic("🎉 *¡Gracias por tu pedido! Está en proceso y será enviado a la brevedad. 🛵💨*");
            await flowDynamic("❌ *Si deseas cancelar tu pedido, simplemente escribe:* _'Cancelar'_.");
            DatosDelPedido = {
                nombre: "",
                direccion: "",
                nombreProducto: "",
                precio: "",
                sabores: [],
                carrito: []
            };
        } else if (res.includes("no") || res.includes("No")) {
            await flowDynamic("❌ *Haz cancelado el pedido! 🌟");
        } else {
            DatosDelPedido = {
                nombre: "",
                direccion: "",
                nombreProducto: "",
                precio: "",
                sabores: [],
                carrito: []
            };
            await flowDynamic("⚠️ *Respuesta no válida.* Por favor, vuelve a intentarlo más tarde.");
        }
    })

    

// Flujo para Torta Helada
const flowTortaHelada = addKeyword(EVENTS.ACTION)
    .addAnswer(menuTortas, { capture: true }, async (ctx, { flowDynamic }) => {

        const ultimoProducto = DatosDelPedido.carrito[DatosDelPedido.carrito.length - 1];

        if (ultimoProducto) {
            ultimoProducto.sabores = ctx.body; // Asigna los sabores al último producto del carrito
            await flowDynamic(`✅ *Sabores seleccionados:* ${ctx.body}`);
        } else {
            await flowDynamic("⚠️ *No hay un producto en el carrito para agregar sabores.*");
        }
    })
    .addAnswer("¿Deseas agregar más productos al carrito? 'Si' para agregar otro producto 'No' Para seguir y terminar el pedido",{capture:true}, async(ctx,{flowDynamic,fallbBack,gotoFlow})=>{
        const res = ctx.body.toLowerCase();
        if (res.includes("si") || res.includes("Si")) {
            
            return gotoFlow(flowMenuProductos);
        } 
    })
    .addAnswer("🙋‍♂️ *Por favor, indícanos tu nombre y apellido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.nombre = ctx.body;
        await flowDynamic(`📝 *Nombre registrado:* ${ctx.body}`);
    })
    .addAnswer("🏠 *Escribe la dirección a la que deseas que enviemos tu pedido:*", { capture: true }, async (ctx, { flowDynamic }) => {
        DatosDelPedido.direccion = ctx.body;
        await flowDynamic(`📍 *Dirección confirmada:* ${ctx.body}`);
    })
    .addAnswer("✅ *Si estás listo para confirmar tu pedido, escribe:* _'Sí', 'Ok' o 'Aceptar'._ o para cancelar: 'No'.", { capture: true }, async (ctx, { flowDynamic }) => {
        const res = ctx.body.toLowerCase();
        if (res.includes("sí") || res.includes("ok") || res.includes("aceptar") || res.includes("si") || res.includes("Si") || res.includes("Sí")) {
            await mostrarCarrito(ctx, { flowDynamic });
            await flowDynamic("🎉 *¡Gracias por tu pedido! Está en proceso y será enviado a la brevedad. 🛵💨*");
            await flowDynamic("❌ *Si deseas cancelar tu pedido, simplemente escribe:* _'Cancelar'_.");
            DatosDelPedido = {
                nombre: "",
                direccion: "",
                nombreProducto: "",
                precio: "",
                sabores: [],
                carrito: []
            };
        } else if (res.includes("no") || res.includes("No")) {
            await flowDynamic("❌ *Haz cancelado el pedido! 🌟");
        } else {
            DatosDelPedido = {
                nombre: "",
                direccion: "",
                nombreProducto: "",
                precio: "",
                sabores: [],
                carrito: []
            };
            await flowDynamic("⚠️ *Respuesta no válida.* Por favor, vuelve a intentarlo más tarde.");
        }
    })

// Ajuste en el flujo de menú de productos
const flowMenuProductos = addKeyword(EVENTS.ACTION)
    .addAnswer("🍨 *¿Qué producto deseas ordenar hoy?*")
    .addAnswer(menuProductos, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        const opcionesValidas = ["1", "2", "3", "4", "5"];
        const res = ctx.body;
        if (!opcionesValidas.includes(ctx.body)) {
            await flowDynamic("⚠️*Opción no válida.* Ingresa una opcion del menu.");
            return gotoFlow(flowMenuProductos)
        }

        let producto = {
            nombreProducto: "",
            precio: 0,
            sabores: DatosDelPedido.sabores
        };

        switch (ctx.body) {
            case "1":
                producto.precio = 10000;
                producto.nombreProducto = "1 KG de Helado";
                DatosDelPedido.carrito.push(producto);
                await flowDynamic(`✅ *Producto agregado al carrito:* ${producto.nombreProducto} por $${producto.precio}`);
                return gotoFlow(flowMenu1KG); // Redirige al flujo de sabores
            case "2":
                producto.precio = 5500;
                producto.nombreProducto = "1/2 KG de Helado";
                DatosDelPedido.carrito.push(producto);
                await flowDynamic(`✅ *Producto agregado al carrito:* ${producto.nombreProducto} por $${producto.precio}`);
                return gotoFlow(flowMenu1KG); // Redirige al flujo de sabores
            case "3":
                producto.precio = 3000;
                producto.nombreProducto = "1/4 KG de Helado";
                DatosDelPedido.carrito.push(producto);
                await flowDynamic(`✅ *Producto agregado al carrito:* ${producto.nombreProducto} por $${producto.precio}`);
                return gotoFlow(flowMenu1KG); // Redirige al flujo de sabores
            case "4":
                producto.precio = 12000;
                producto.nombreProducto = "Caja de Helado Palito";
                DatosDelPedido.carrito.push(producto);
                await flowDynamic(`✅ *Producto agregado al carrito:* ${producto.nombreProducto} por $${producto.precio}`);
                return gotoFlow(flowCajaHeladoPalito); // Redirige al flujo de Caja de Helado Palito
            case "5":
                producto.precio = 15000;
                producto.nombreProducto = "Torta Helada";
                DatosDelPedido.carrito.push(producto);
                await flowDynamic(`✅ *Producto agregado al carrito:* ${producto.nombreProducto} por $${producto.precio}`);
                return gotoFlow(flowTortaHelada); // Redirige al flujo de Torta Helada
            default:
                break;
        }
    });


// Flujo principal
const flowPrincipal = addKeyword(['hola heladeria'])
    .addAnswer('👋 *¡Bienvenido a Heladería Ice Cream!* 🍦')
    .addAnswer("¿Te gustaría realizar un pedido hoy? Responde con 'Sí' para continuar o 'No' para salir.", { capture: true }, async (ctx, { gotoFlow, fallbBack, flowDynamic }) => {
        const res = ctx.body;
        const opcionesValidas = ["si", "Si", "SI", "Sí", "sí", "no", "No", "NO"];
        if (!opcionesValidas.includes(ctx.body)) {
             await flowDynamic("⚠️ *Opción no válida.* Ingrese 'Si' o 'No'.");
             return gotoFlow(flowPrincipal)
        }
        let opc = "";
        if (["Si", "si", "SI", "Sí", "sí"].includes(res)) {
            opc = "1";
        } else {
            await flowDynamic("❌ *Has decidido salir. ¡Esperamos verte pronto!*");
        }
        switch (opc) {
            case "1":
                return gotoFlow(flowMenuProductos);
                     // Redirige al menú de productos
            case "0":
                return await flowDynamic("👋 *Gracias por visitar Ice Cream.* ¡Vuelve pronto!");
        }
    });

// Configuración principal del bot
const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal, flowMenuProductos, flowMenu1KG, flowCancelar,flowTortaHelada,flowCajaHeladoPalito]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb({
        port: process.env.PORT || 8000
    });
};

main();
