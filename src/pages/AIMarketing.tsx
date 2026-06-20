import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateInstagramPost, generateText } from '../services/aiService';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'whatsapp' | 'success' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  background: ${props => {
    switch (props.$variant) {
      case 'whatsapp': return '#25D366';
      case 'success': return '#48bb78';
      case 'danger': return '#f56565';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  color: white;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  margin-right: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Result = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ImagePreview = styled.img`
  max-width: 300px;
  border-radius: 8px;
  margin-top: 12px;
`;

const CopyButton = styled(Button)`
  background: #667eea;
  margin-top: 8px;
`;

const EnvioSection = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin: 8px 0;
`;

const Hint = styled.p`
  color: #888;
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 12px;
  font-style: italic;
`;

const Examples = styled.div`
  background: #f0f4ff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #667eea;
`;

const ExampleTitle = styled.p`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ExampleText = styled.p`
  color: #666;
  font-size: 13px;
  margin: 2px 0;
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  align-items: center;
`;

const StatusText = styled.span<{ $isRecording?: boolean }>`
  color: ${props => (props.$isRecording ? '#f56565' : '#666')};
  font-size: 14px;
  margin-left: 8px;
  font-weight: ${props => (props.$isRecording ? '600' : '400')};
  animation: ${props => (props.$isRecording ? 'pulse 1s infinite' : 'none')};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

// 🔥 Componente de TextArea com auto-resize
const AutoResizeTextArea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  id?: string;
}> = ({ value, onChange, placeholder, rows = 3, readOnly = false, id }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
    adjustHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    adjustHeight();
  };

  return (
    <textarea
      ref={textareaRef}
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      style={{
        width: '100%',
        padding: '12px',
        border: readOnly ? '1px solid #e2e8f0' : '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '16px',
        resize: 'none',
        overflow: 'hidden',
        minHeight: readOnly ? '60px' : '80px',
        maxHeight: readOnly ? 'none' : '400px',
        lineHeight: '1.6',
        background: readOnly ? 'white' : 'transparent',
        marginBottom: '12px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  );
};

// Gerar link do WhatsApp
const generateWhatsAppLink = (telefone: string, mensagem: string) => {
  const cleanPhone = telefone.replace(/\D/g, '');
  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(mensagem)}`;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AIMarketing: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<{ text: string; imageURL?: string } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [enviarParaTodos, setEnviarParaTodos] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 🔥 Converter voz em texto (Speech to Text)
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let speechDetected = false;

    recognition.onstart = () => {
      setIsRecording(true);
      toast.success('🎤 Ouvindo... Fale agora!', { duration: 5000 });

      setTimeout(() => {
        if (isRecording && !speechDetected) {
          recognition.stop();
          toast('⏳ Nenhuma fala detectada. Tente falar mais alto.', {
            icon: '🎤',
            duration: 3000,
          });
        }
      }, 5000);
    };

    recognition.onaudiostart = () => {
      speechDetected = true;
    };

    recognition.onresult = (event: any) => {
      speechDetected = true;

      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript.trim())
        .filter((text: string) => text.length > 0)
        .join(' ');

      const formattedText = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      setPrompt(formattedText);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);

      switch (event.error) {
        case 'no-speech':
          toast('🎤 Nenhuma fala detectada. Clique em "Falar Prompt" e fale imediatamente.', {
            icon: '💡',
            duration: 4000,
          });
          break;
        case 'not-allowed':
          toast.error('❌ Permita o acesso ao microfone nas configurações do navegador.');
          break;
        case 'audio-capture':
          toast.error('❌ Nenhum microfone encontrado. Conecte um microfone.');
          break;
        case 'network':
          toast.error('❌ Erro de rede. Verifique sua conexão.');
          break;
        default:
          toast.error(`❌ Erro: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (prompt.trim()) {
        toast.success('✅ Prompt reconhecido!');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      toast.error('Erro ao acessar o microfone. Tente recarregar a página.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast('🎤 Reconhecimento interrompido', { icon: '🎤', duration: 3000 });
    }
  };

  // 🔥 Ler texto em voz alta (Text-to-Speech)
  const textToSpeech = () => {
    if (!post?.text) {
      toast.error('Gere um texto primeiro');
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast.error('Seu navegador não suporta síntese de voz.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      toast('🔇 Leitura pausada', { icon: '🔇', duration: 3000 });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(post.text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(
      (voice) => voice.lang.includes('pt') || voice.lang.includes('PT')
    );
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      toast('🔊 Lendo...');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      toast.success('🔊 Leitura finalizada!');
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error('Erro ao ler o texto');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopTextToSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      toast('🔇 Leitura interrompida', { icon: '🔇', duration: 3000 });
    }
  };

  // 🔥 Gerar conteúdo com IA
  const handleGeneratePost = async () => {
    if (!prompt.trim()) {
      toast.error('Descreva o que você quer gerar');
      return;
    }

    setLoading(true);
    try {
      const result = await generateInstagramPost(prompt);
      setPost(result);
      toast.success('Post gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar post');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!prompt.trim()) {
      toast.error('Descreva o que você quer gerar');
      return;
    }

    setLoading(true);
    try {
      const text = await generateText(prompt);
      setPost({ text });
      toast.success('Mensagem gerada!');
    } catch (error) {
      toast.error('Erro ao gerar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (post?.text) {
      navigator.clipboard.writeText(post.text);
      toast.success('Copiado!');
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!post?.text) {
      toast.error('Gere uma mensagem primeiro');
      return;
    }

    if (!enviarParaTodos && !phoneNumber) {
      toast.error('Digite um número de telefone ou marque "Enviar para todos"');
      return;
    }

    if (enviarParaTodos) {
      toast('Função "Enviar para todos" será implementada em breve!', {
        icon: '🚀',
        duration: 3000,
      });
      return;
    }

    const link = generateWhatsAppLink(phoneNumber, post.text);
    window.open(link, '_blank');
  };

  const handleSalvarCampanha = async () => {
    if (!user || !post) {
      toast.error('Gere um conteúdo primeiro');
      return;
    }

    try {
      await addDoc(collection(db, 'campaigns'), {
        userId: user.uid,
        prompt: prompt,
        message: post.text,
        imageURL: post.imageURL || null,
        createdAt: new Date(),
      });
      toast.success('Campanha salva no histórico!');
    } catch (error) {
      toast.error('Erro ao salvar campanha');
    }
  };

  return (
    <Container>
      <Title>🤖 Marketing com IA</Title>

      <Card>
        <h3>📝 Descreva o que você quer gerar</h3>
        <p style={{ color: '#666', marginBottom: 12 }}>
          Seja detalhado! Quanto mais específico você for, melhor será o resultado.
          <br />
          <small>Usa Groq (texto) + Pollinations (imagem) - 100% gratuito!</small>
        </p>

        <Examples>
          <ExampleTitle>💡 Exemplos de prompts:</ExampleTitle>
          <ExampleText>
            "Crie uma mensagem para WhatsApp sobre um tema que deseja, oferecendo 15% de desconto para novas clientes,
            válido por 3 dias. Use emojis"
          </ExampleText>
          <br />
          <ExampleText>
            "Escreva uma legenda para Instagram sobre uma promoção de um serviço ou produto
            com tom divertido e descontraído, mencionando que é para comemorar o aniversário do estabelecimento.
            Inclui um emoji e uma chamada para ação."
          </ExampleText>
          <br />
          <ExampleText>
            "Crie um anúncio para Facebook sobre consultoria de marketing digital,
            com tom profissional, destacando os benefícios de aumentar as vendas em 30%,
            incluindo um depoimento fictício de um cliente satisfeito."
          </ExampleText>
        </Examples>

        <Label htmlFor="prompt">✏️ Seu prompt *</Label>

        <ButtonGroup>
          <Button
            $variant={isRecording ? 'danger' : 'primary'}
            onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
          >
            {isRecording ? '⏹️ Parar Gravação' : '🎤 Falar Prompt'}
          </Button>
          <StatusText $isRecording={isRecording}>
            {isRecording ? '🔴 Gravando...' : 'Clique para falar'}
          </StatusText>
        </ButtonGroup>

        <AutoResizeTextArea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva detalhadamente o que você quer que a IA gere... (ou clique em Falar Prompt)"
          rows={3}
        />

        <Hint>
          💡 Inclua: tipo de mensagem (WhatsApp/Instagram/Facebook), tom
          (romântico/profissional/divertido), público-alvo, oferta, prazo, emojis, e qualquer outra
          instrução específica.
          <br />
          🎤 Você também pode falar o prompt clicando no botão acima!
        </Hint>

        <Grid>
          <Button $variant="primary" onClick={handleGeneratePost} disabled={loading}>
            {loading ? '⏳ Gerando...' : '📸 Gerar Post (Texto + Imagem)'}
          </Button>
          <Button $variant="primary" onClick={handleGenerateMessage} disabled={loading}>
            {loading ? '⏳ Gerando...' : '💬 Gerar Mensagem WhatsApp'}
          </Button>
        </Grid>
      </Card>

      {post && (
        <Card>
          <h3>📝 Resultado</h3>

          <ButtonGroup>
            <Button
              $variant={isPlaying ? 'danger' : 'success'}
              onClick={isPlaying ? stopTextToSpeech : textToSpeech}
            >
              {isPlaying ? '🔇 Parar Leitura' : '🔊 Ouvir Resultado'}
            </Button>
            <StatusText>{isPlaying ? '🔊 Lendo...' : 'Clique para ouvir'}</StatusText>
          </ButtonGroup>

          <Result>
            <AutoResizeTextArea
              value={post.text}
              onChange={() => { }}
              readOnly={true}
              placeholder="O resultado aparecerá aqui..."
              rows={2}
            />
            <CopyButton $variant="primary" onClick={copyToClipboard}>
              📋 Copiar Texto
            </CopyButton>
          </Result>

          {post.imageURL && (
            <div>
              <h4>🖼️ Imagem Gerada</h4>
              <ImagePreview src={post.imageURL} alt="Post gerado" />
              <br />
              <Button $variant="success" onClick={() => window.open(post.imageURL, '_blank')}>
                📥 Baixar Imagem
              </Button>
            </div>
          )}

          <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <h4>📤 Enviar Mensagem</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              Cole o número do cliente ou marque para enviar para todos os clientes cadastrados.
            </p>

            <CheckboxLabel>
              <input
                type="checkbox"
                checked={enviarParaTodos}
                onChange={(e) => setEnviarParaTodos(e.target.checked)}
              />
              Enviar para todos os clientes cadastrados
            </CheckboxLabel>

            {!enviarParaTodos && (
              <Input
                placeholder="Número do WhatsApp (ex: 79999999999)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            )}

            <EnvioSection>
              <Button $variant="whatsapp" onClick={handleEnviarWhatsApp}>
                💬 Enviar via WhatsApp (link)
              </Button>
              <Button $variant="success" onClick={handleSalvarCampanha}>
                💾 Salvar Campanha
              </Button>
            </EnvioSection>

            <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
              💡 O link do WhatsApp abrirá o app com a mensagem pré-preenchida. Você só precisa clicar
              em enviar.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h3>📊 Como enviar mensagens em massa?</h3>
        <ul style={{ color: '#666', lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            <strong>Grátis:</strong> Copie a mensagem e cole manualmente no WhatsApp/Instagram
          </li>
          <li>
            <strong>Link direto:</strong> Use o botão acima para abrir o WhatsApp com a mensagem pronta
          </li>
        </ul>
      </Card>
    </Container>
  );
};

export default AIMarketing;