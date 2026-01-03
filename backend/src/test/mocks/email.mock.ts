export const sendEmailMock = jest.fn().mockResolvedValue(undefined);

export const emailTemplatesMock = {
  welcome: jest.fn().mockReturnValue({
    subject: 'Bem-vinda ao Izabela Tarot!',
    html: '<p>Welcome email content</p>',
  }),
  passwordReset: jest.fn().mockReturnValue({
    subject: 'Redefinição de Senha',
    html: '<p>Password reset content</p>',
  }),
  orderConfirmation: jest.fn().mockReturnValue({
    subject: 'Pedido Confirmado',
    html: '<p>Order confirmation content</p>',
  }),
  orderPaid: jest.fn().mockReturnValue({
    subject: 'Pagamento Confirmado',
    html: '<p>Payment confirmed content</p>',
  }),
  readingReady: jest.fn().mockReturnValue({
    subject: 'Sua Leitura Está Pronta',
    html: '<p>Reading ready content</p>',
  }),
  appointmentConfirmation: jest.fn().mockReturnValue({
    subject: 'Agendamento Confirmado',
    html: '<p>Appointment confirmation content</p>',
  }),
  appointmentReminder: jest.fn().mockReturnValue({
    subject: 'Lembrete de Agendamento',
    html: '<p>Appointment reminder content</p>',
  }),
};

jest.mock('../../utils/email.util', () => ({
  sendEmail: sendEmailMock,
  emailTemplates: emailTemplatesMock,
}));

jest.mock('../../utils', () => {
  const originalModule = jest.requireActual('../../utils');
  return {
    ...originalModule,
    sendEmail: sendEmailMock,
    emailTemplates: emailTemplatesMock,
  };
});
