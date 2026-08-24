import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Email Templates API', () => {
  test('list email templates without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/email-templates');
    await logResponseOnFailure(response, 'list email templates without token');
    expect(response.status()).toBe(401);
  });

  test('list email templates', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.list();
    await logResponseOnFailure(response, 'list email templates');
    expect(response.status()).toBe(200);
  });

  test('create email template', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.create({
      name: unique('Template'),
      subject: 'Hello',
      content: '<p>Hello</p>',
    });
    await logResponseOnFailure(response, 'create email template');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create email template with empty payload', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.create({});
    await logResponseOnFailure(response, 'create email template with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show email template', async ({ emailTemplateService }) => {
    const createResponse = await emailTemplateService.create({
      name: unique('Template'),
      subject: 'Hello',
      content: '<p>Hello</p>',
    });
    const { data } = await createResponse.json();

    const response = await emailTemplateService.getById(data.id);
    await logResponseOnFailure(response, 'show email template');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show email template not found', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.getById(999999);
    await logResponseOnFailure(response, 'show email template not found');
    expect(response.status()).toBe(404);
  });

  test('update email template', async ({ emailTemplateService }) => {
    const createResponse = await emailTemplateService.create({
      name: unique('Template'),
      subject: 'Hello',
      content: '<p>Hello</p>',
    });
    const { data } = await createResponse.json();

    const response = await emailTemplateService.update(data.id, { name: unique('Template') });
    await logResponseOnFailure(response, 'update email template');
    expect(response.status()).toBe(422);
  

  });

  test('update email template with empty payload', async ({ emailTemplateService }) => {
    const createResponse = await emailTemplateService.create({
      name: unique('Template'),
      subject: 'Hello',
      content: '<p>Hello</p>',
    });
    const { data } = await createResponse.json();

    const response = await emailTemplateService.update(data.id, {});
    await logResponseOnFailure(response, 'update email template with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete email template', async ({ emailTemplateService }) => {
    const createResponse = await emailTemplateService.create({
      name: unique('Template'),
      subject: 'Hello',
      content: '<p>Hello</p>',
    });
    const { data } = await createResponse.json();

    const response = await emailTemplateService.delete(data.id);
    await logResponseOnFailure(response, 'delete email template');
    expect(response.status()).toBe(200);
  });

  test('delete email template not found', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.delete(999999);
    await logResponseOnFailure(response, 'delete email template not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/email-templates/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue136: create email template with duplicate name', async ({ emailTemplateService }) => {
    const name = unique('Template');
    await emailTemplateService.create({ name, subject: 'Hello', content: '<p>Hello</p>' });
    const response = await emailTemplateService.create({ name, subject: 'Hello', content: '<p>Hello</p>' });
    await logResponseOnFailure(response, 'issue136: create email template with duplicate name');
    expect(response.status()).toBe(422);
  });

  test('issue137: show email template with invalid id', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.getById(999999);
    await logResponseOnFailure(response, 'issue137: show email template with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue138: update email template with invalid id', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.update(999999, { name: unique('Template') });
    await logResponseOnFailure(response, 'issue138: update email template with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue139: delete email template with invalid id', async ({ emailTemplateService }) => {
    const response = await emailTemplateService.delete(999999);
    await logResponseOnFailure(response, 'issue139: delete email template with invalid id');
    expect(response.status()).toBe(404);
  });
});
