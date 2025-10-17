console.log("Asistente IA cargado");

function assistantReply(message){
    const lower = message.toLowerCase();
    if(lower.includes("hola")) return "Hola, soy tu asistente de Galaxy X 😊";
    if(lower.includes("video")) return "Puedes ir a la sección de Videos y elegir uno para ver!";
    if(lower.includes("chat")) return "Ve a la sección de Chats para interactuar con otros usuarios.";
    if(lower.includes("foro")) return "En el Foro puedes compartir tus ideas 📜";
    if(lower.includes("perfil")) return "Puedes crear tu perfil con nombre y avatar para personalizar tu experiencia.";
    return "Estoy procesando tu mensaje... Pronto tendré respuestas más inteligentes!";
}
