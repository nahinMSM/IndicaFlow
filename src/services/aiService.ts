import { AIMessage } from '../types';

// Geração de imagem com Pollinations.ai (gratuito, sem limite)
export const generateImage = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(
    `${prompt}, estilo profissional, clean, moderno, convidativo, sem texto`
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true`;
};

// 🔥 Geração de texto com Groq - O USUÁRIO CONTROLA 100% O PROMPT
export const generateText = async (prompt: string): Promise<string> => {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NÃO ENCONTRADA');
  console.log('📝 Prompt do usuário:', prompt);

  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY não encontrada. Usando fallback.');
    return `✨ ${prompt}`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Você é um especialista em marketing para pequenos negócios. 
            
            ⚠️ IMPORTANTE: O usuário vai descrever EXATAMENTE o que ele quer. 
            Siga as instruções dele à risca. Não adicione nada que ele não pediu.
            Não inclua descontos, prazos ou ofertas a menos que ele mencione.
            Respeite o tom, estilo, público-alvo e formato solicitado.
            
            Regras:
            - Máximo 80 palavras para WhatsApp
            - Máximo 150 palavras para Instagram/Facebook
            - Use emojis se o usuário pedir
            - Não use hashtags a menos que o usuário peça`
          },
          { 
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 250
      })
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro da API Groq:', errorData);
      
      if (errorData.error?.code === 'model_decommissioned') {
        console.warn('⚠️ Modelo descontinuado, tentando fallback...');
        const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [
              { 
                role: "system", 
                content: `Você é um especialista em marketing. Siga as instruções do usuário exatamente como ele pedir.`
              },
              { 
                role: "user", 
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 200
          })
        });

        if (!fallbackResponse.ok) {
          const fallbackError = await fallbackResponse.json();
          throw new Error(`Fallback também falhou: ${JSON.stringify(fallbackError)}`);
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData.choices[0].message.content;
      }

      throw new Error(`API Groq retornou erro: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da Groq:', data);
    
    const generatedText = data.choices[0].message.content;
    return generatedText;
  } catch (error) {
    console.error('❌ Erro ao gerar texto com Groq:', error);
    return `✨ ${prompt}`;
  }
};

// 🔥 Gerar post completo - O USUÁRIO CONTROLA 100% O PROMPT
export const generateInstagramPost = async (prompt: string): Promise<AIMessage> => {
  // 🔥 Usa o prompt do usuário para gerar a imagem também
  const imageURL = generateImage(prompt);
  
  // 🔥 O texto é gerado baseado no prompt do usuário
  const text = await generateText(prompt);
  
  return { text, imageURL };
};

// 🔥 Gerar mensagem de indicação - O USUÁRIO CONTROLA 100% O PROMPT
export const generateReferralMessage = async (prompt: string): Promise<string> => {
  return await generateText(prompt);
};