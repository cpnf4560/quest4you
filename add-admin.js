/**
 * Script para adicionar um utilizador como admin
 * Este script deve ser executado DEPOIS de o utilizador fazer login pela primeira vez
 * Uso: node add-admin.js
 */

// Este script usa a Firebase Web SDK (não Admin SDK)
// Execute este código no console do browser quando estiver autenticado

const script = `
// Script para executar no console do browser
// 1. Faz login com carlos.sousacorreia@gmail.com
// 2. Vai para a página de perfil
// 3. Abre o console (F12)
// 4. Cola e executa este código:

(async () => {
  const currentUser = firebase.auth().currentUser;
  
  if (!currentUser) {
    console.error('❌ Não estás autenticado. Faz login primeiro!');
    return;
  }
  
  console.log('👤 User atual:', currentUser.email);
  console.log('🆔 UID:', currentUser.uid);
  
  try {
    // Atualizar o documento do utilizador para adicionar role admin
    await firebase.firestore()
      .collection('quest4you_users')
      .doc(currentUser.uid)
      .set({
        role: 'admin',
        isAdmin: true,
        adminSince: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    console.log('✅ Admin role adicionada com sucesso!');
    console.log('🔄 Recarrega a página para ver as funcionalidades de admin.');
  } catch (error) {
    console.error('❌ Erro ao adicionar admin role:', error);
  }
})();
`;

console.log('='.repeat(70));
console.log('📋 INSTRUÇÕES PARA ADICIONAR ADMIN');
console.log('='.repeat(70));
console.log('');
console.log('1. Abre o website Quest4You no browser');
console.log('2. Faz login com: carlos.sousacorreia@gmail.com');
console.log('3. Vai para a página de Perfil');
console.log('4. Abre o Console do Developer Tools (F12 > Console)');
console.log('5. Cola e executa o seguinte código:');
console.log('');
console.log('='.repeat(70));
console.log(script);
console.log('='.repeat(70));
console.log('');
console.log('Alternativa: Adiciona manualmente no Firebase Console');
console.log('https://console.firebase.google.com/project/quest4couple/firestore');
console.log('');
console.log('Depois de fazer login com carlos.sousacorreia@gmail.com,');
console.log('procura o documento com o teu UID na coleção "quest4you_users"');
console.log('e adiciona os campos:');
console.log('  - role: "admin"');
console.log('  - isAdmin: true');
console.log('');
