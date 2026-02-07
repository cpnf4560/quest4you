/**
 * Script para apagar uma conversa e suas mensagens
 * Execute no console do browser quando estiver autenticado como admin
 * 
 * Uso:
 * 1. Faz login no Quest4You
 * 2. Abre o console do browser (F12)
 * 3. Cola e executa o código abaixo
 */

const deleteConversationScript = `
// ================================
// APAGAR CONVERSA COM CARLOS CORREIA
// ================================
// Cole este código no console do browser

(async () => {
  const db = firebase.firestore();
  const currentUser = firebase.auth().currentUser;
  
  if (!currentUser) {
    console.error('❌ Não estás autenticado!');
    return;
  }
  
  console.log('🔍 A procurar conversas...');
  
  try {
    // Procurar conversas onde o participante seja "Carlos Correia" ou tenha esse nome
    const conversations = await db.collection('quest4you_conversations')
      .where('participants', 'array-contains', currentUser.uid)
      .get();
    
    console.log('📋 Conversas encontradas:', conversations.size);
    
    for (const doc of conversations.docs) {
      const conv = doc.data();
      console.log('---');
      console.log('ID:', doc.id);
      console.log('Participantes:', conv.participants);
      console.log('friendName:', conv.friendName);
      console.log('lastMessage:', conv.lastMessage);
    }
    
    // DEPOIS DE IDENTIFICAR O ID DA CONVERSA, DESCOMENTA E SUBSTITUI:
    /*
    const conversationId = 'COLOCA_AQUI_O_ID_DA_CONVERSA';
    
    // Apagar todas as mensagens da conversa
    const messages = await db.collection('quest4you_messages')
      .where('conversationId', '==', conversationId)
      .get();
    
    console.log('🗑️ A apagar', messages.size, 'mensagens...');
    
    for (const msgDoc of messages.docs) {
      await msgDoc.ref.delete();
      console.log('  Apagada mensagem:', msgDoc.id);
    }
    
    // Apagar a conversa
    await db.collection('quest4you_conversations').doc(conversationId).delete();
    console.log('✅ Conversa apagada!');
    
    // Refresh para ver as mudanças
    location.reload();
    */
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
`;

console.log('='.repeat(70));
console.log('📋 SCRIPT PARA APAGAR CONVERSA');
console.log('='.repeat(70));
console.log('');
console.log('1. Abre o Quest4You no browser e faz login');
console.log('2. Vai para a página de chat: /pages/chat.html');
console.log('3. Abre o console do browser (F12 → Console)');
console.log('4. Cola o código abaixo:');
console.log('');
console.log('-'.repeat(70));
console.log(deleteConversationScript);
console.log('-'.repeat(70));
console.log('');
console.log('5. Primeiro executa para ver todas as conversas e identificar o ID');
console.log('6. Depois descomenta a secção de delete e substitui o ID');
console.log('7. Executa novamente para apagar');
