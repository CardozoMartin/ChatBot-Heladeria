const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const path = require("path");
const fs = require("fs");

const Productos = path.join(__dirname, "menuProductos.txt");
const menuProductos = fs.readFileSync(Productos, "utf-8");

const sabor = path.join(__dirname, "menuSabores.txt");
const menuSabores = fs.readFileSync(sabor, "utf-8");

const saboresParaElegir = [
    "Vainilla", "Chocolate", "Fresa", "Dulce de Leche", "Limón", 
    "Menta Granizada", "Cookies & Cream", "Pistacho", "Coco", "Tarta de Queso con Frutos Rojos"
];

const saboresElegidos = [];

const flowMenuSabores = addKeyword(EVENTS.ACTION)
    .addAnswer("Puedes elegir hasta 3 sabores. Escribe el número correspondiente al sabor que deseas.")
    .addAnswer(`Opciones disponibles:\n${saboresParaElegir.join("\n")}`)
    .addAnswer("¿Cuál es tu primer sabor?", { capture: true }, async (ctx, { flowDynamic }) => {
        // Verificar y mostrar lo que llega en la respuesta
        console.log("Respuesta del usuario:", ctx.body); // Ver en la consola
        await flowDynamic(`✅ Respuesta recibida: ${ctx.body}`); // Mostrar al usuario lo que respondió

        // Validar que la respuesta esté en las opciones válidas
        const saborElegido = ctx.body;
        if (!saboresParaElegir.includes(saborElegido)) {
            return await flowDynamic("Sabor no válido. Por favor, elige un sabor de la lista.");
        }

        // Añadir el sabor al arreglo
        saboresElegidos.push(saborElegido);
        console.log(saboresElegidos); // Ver en la consola los sabores elegidos

        // Continuar con la selección de sabores o mostrar los sabores elegidos
        if (saboresElegidos.length < 3) {
            return await flowDynamic(`✅ Has elegido ${saborElegido}. Ahora elige el siguiente sabor.`);
        }

        return await flowDynamic(`🎉 ¡Perfecto! Estos son los sabores que elegiste:\n${saboresElegidos.join("\n")}\n🍦 ¡Disfruta tu pedido!`);
    });


const flowMenuProductos = addKeyword(EVENTS.ACTION)
    .addAnswer("¿Qué producto deseas pedir?")
    .addAnswer(menuProductos, { capture: true }, async (ctx, { gotoFlow, fallbBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "5"].includes(ctx.body)) {
            return fallbBack("Respuesta no válida. Por favor selecciona una de las opciones");
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowMenuSabores);
            case "2":
                return await flowDynamic("Elegiste el medio kilo de helado");
            case "3":
                return await flowDynamic("Elegiste el cuarto kilo de helado");
            case "4":
                return await flowDynamic("Elegiste la caja de helado");
            case "5":
                return await flowDynamic("Elegiste la torta de helado");
            default:
                break;
        }
    });

module.exports = flowMenuProductos;
