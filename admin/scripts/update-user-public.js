/**
 * Script para atualizar o perfil de um utilizador para público
 * Execute este código no console do browser quando estiver autenticado como ADMIN
 * 
 * Uso:
 * 1. Faz login como admin no Quest4You
 * 2. Abre o console do browser (F12)
 * 3. Cola e executa este código
 */

const updateUserToPublicScript = `
// Script para executar no console do browser (como admin)

(async () => {
  const EMAIL_TO_UPDATE = 'anairiscandeiasreis@gmail.com';
  
  console.log('🔍 A procurar utilizador:', EMAIL_TO_UPDATE);
  
  try {
    // Procurar o utilizador pelo email
    const usersRef = firebase.firestore().collection('quest4you_users');
    const snapshot = await usersRef.where('email', '==', EMAIL_TO_UPDATE).get();
    
    if (snapshot.empty) {
      console.error('❌ Utilizador não encontrado com email:', EMAIL_TO_UPDATE);
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('✅ Utilizador encontrado!');
    console.log('📧 Email:', userData.email);
    console.log('👤 Nome:', userData.displayName || userData.nickname || 'N/A');
    console.log('🆔 UID:', userDoc.id);
    console.log('📊 Settings atuais:', userData.settings);
    
    // Atualizar para perfil público
    await usersRef.doc(userDoc.id).update({
      'settings.publicProfile': true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('');
    console.log('✅ Perfil atualizado para PÚBLICO com sucesso!');
    console.log('🎉 O utilizador agora aparece no Smart Match.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
`;

console.log('='.repeat(70));
console.log('📋 SCRIPT PARA ATUALIZAR PERFIL PARA PÚBLICO');
console.log('='.repeat(70));
console.log('');
console.log('Cola o seguinte código no console do browser:');
console.log('');
console.log(updateUserToPublicScript);
console.log('');
console.log('='.repeat(70));
