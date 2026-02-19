import { useState, useEffect } from 'react';
import {
  IconCreditCard,
  IconDeviceFloppy,
  IconWallet,
  IconQrcode,
  IconBrandWhatsapp,
  IconCheck,
  IconAlertTriangle,
  IconSettings,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import '../Admin.css';

const DEFAULT_SETTINGS = {
  mercadoPagoEnabled: false,
  pixEnabled: true,
  creditCardEnabled: false,
  whatsappEnabled: true,
  sandbox: true,
  siteUrl: '',
  webhookUrl: '',
  publicKey: '',
};

const PAYMENT_SETTINGS_DOC = 'mercadoPago';

const PaymentSettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'paymentSettings', PAYMENT_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error('[PaymentSettings] Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const docRef = doc(db, 'paymentSettings', PAYMENT_SETTINGS_DOC);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('[PaymentSettings] Erro ao salvar:', error);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="admin-page-header">
          <h1>Pagamentos</h1>
          <p>Carregando configurações...</p>
        </div>
      </>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="admin-page-header">
        <h1>Pagamentos</h1>
        <p>Configure os métodos de pagamento e integração com Mercado Pago</p>
      </div>

      {saveMessage && (
        <div className={`payment-alert ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? (
            <IconCheck size={18} stroke={2} />
          ) : (
            <IconAlertTriangle size={18} stroke={2} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <motion.div className="payment-settings-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        {/* Métodos de Pagamento Ativos */}
        <div className="payment-settings-card">
          <div className="payment-card-header">
            <IconCreditCard size={22} stroke={1.6} />
            <h2>Métodos de Pagamento</h2>
          </div>
          <p className="payment-card-description">
            Ative ou desative os métodos de pagamento disponíveis para os clientes.
          </p>

          <div className="payment-methods-list">
            <label className="payment-toggle-item">
              <div className="payment-toggle-info">
                <IconBrandWhatsapp size={20} stroke={1.6} />
                <div>
                  <span className="toggle-label">WhatsApp Checkout</span>
                  <span className="toggle-desc">Finalização via WhatsApp</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
              />
            </label>

            <label className="payment-toggle-item">
              <div className="payment-toggle-info">
                <IconWallet size={20} stroke={1.6} />
                <div>
                  <span className="toggle-label">Mercado Pago</span>
                  <span className="toggle-desc">Checkout completo via Mercado Pago</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.mercadoPagoEnabled}
                onChange={(e) => handleChange('mercadoPagoEnabled', e.target.checked)}
              />
            </label>

            <label className="payment-toggle-item">
              <div className="payment-toggle-info">
                <IconQrcode size={20} stroke={1.6} />
                <div>
                  <span className="toggle-label">PIX</span>
                  <span className="toggle-desc">Pagamento instantâneo via PIX (Mercado Pago)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.pixEnabled}
                onChange={(e) => handleChange('pixEnabled', e.target.checked)}
              />
            </label>

            <label className="payment-toggle-item">
              <div className="payment-toggle-info">
                <IconCreditCard size={20} stroke={1.6} />
                <div>
                  <span className="toggle-label">Cartão de Crédito</span>
                  <span className="toggle-desc">Pagamento com cartão via Mercado Pago</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.creditCardEnabled}
                onChange={(e) => handleChange('creditCardEnabled', e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Configurações do Mercado Pago */}
        <div className="payment-settings-card">
          <div className="payment-card-header">
            <IconSettings size={22} stroke={1.6} />
            <h2>Configuração Mercado Pago</h2>
          </div>
          <p className="payment-card-description">
            Configure as credenciais e URLs para integração com o Mercado Pago.
            A chave secreta (Access Token) deve ser configurada via Firebase Functions secrets.
          </p>

          <div className="payment-form-group">
            <label htmlFor="publicKey">Chave Pública (Public Key)</label>
            <input
              id="publicKey"
              type="text"
              value={settings.publicKey}
              onChange={(e) => handleChange('publicKey', e.target.value)}
              placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <span className="payment-field-hint">
              Encontrada em: Mercado Pago → Suas integrações → Credenciais
            </span>
          </div>

          <div className="payment-form-group">
            <label htmlFor="siteUrl">URL do Site (para redirecionamento)</label>
            <input
              id="siteUrl"
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleChange('siteUrl', e.target.value)}
              placeholder="https://mmartinestofados.com.br"
            />
            <span className="payment-field-hint">
              URL para onde o cliente será redirecionado após o pagamento
            </span>
          </div>

          <div className="payment-form-group">
            <label htmlFor="webhookUrl">URL do Webhook (Notificações IPN)</label>
            <input
              id="webhookUrl"
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://us-central1-seu-projeto.cloudfunctions.net/mercadoPagoWebhook"
            />
            <span className="payment-field-hint">
              URL para receber notificações de status de pagamento (opcional)
            </span>
          </div>

          <div className="payment-form-group">
            <label className="payment-toggle-item compact">
              <div className="payment-toggle-info">
                <div>
                  <span className="toggle-label">Modo Sandbox (Testes)</span>
                  <span className="toggle-desc">
                    Quando ativo, usa o ambiente de testes do Mercado Pago.
                    Desative para aceitar pagamentos reais.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sandbox}
                onChange={(e) => handleChange('sandbox', e.target.checked)}
              />
            </label>
          </div>

          {!settings.sandbox && (
            <div className="payment-alert warning">
              <IconAlertTriangle size={18} stroke={2} />
              <span>
                <strong>Atenção:</strong> Modo produção ativo. Pagamentos reais serão processados.
                Certifique-se de que as credenciais de produção estão configuradas.
              </span>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="payment-settings-card full-width">
          <div className="payment-card-header">
            <IconAlertTriangle size={22} stroke={1.6} />
            <h2>Configuração do Access Token</h2>
          </div>
          <div className="payment-instructions">
            <p>
              O <strong>Access Token</strong> (chave secreta) do Mercado Pago deve ser
              configurado como secret nas Firebase Cloud Functions por segurança.
              <strong> Nunca</strong> coloque o Access Token no código-fonte ou no navegador.
            </p>
            <div className="payment-code-block">
              <code>firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN</code>
            </div>
            <p>
              Após executar o comando acima, cole o Access Token quando solicitado.
              Em seguida, faça o deploy das Cloud Functions:
            </p>
            <div className="payment-code-block">
              <code>firebase deploy --only functions</code>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="payment-settings-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.35 }}>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <IconDeviceFloppy size={18} stroke={2} />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PaymentSettingsPage;
