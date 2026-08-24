import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Web Forms API', () => {
  test('list web forms without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/web-forms');
    await logResponseOnFailure(response, 'list web forms without token');
    expect(response.status()).toBe(401);
  });

  test('list web forms', async ({ webFormService }) => {
    const response = await webFormService.list();
    await logResponseOnFailure(response, 'list web forms');
    expect(response.status()).toBe(200);
  });

  test('create web form', async ({ webFormService }) => {
    const response = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    await logResponseOnFailure(response, 'create web form');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create web form with empty payload', async ({ webFormService }) => {
    const response = await webFormService.create({});
    await logResponseOnFailure(response, 'create web form with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show web form', async ({ webFormService }) => {
    const createResponse = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    const { data } = await createResponse.json();

    const response = await webFormService.getById(data.id);
    await logResponseOnFailure(response, 'show web form');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show web form not found', async ({ webFormService }) => {
    const response = await webFormService.getById(999999);
    await logResponseOnFailure(response, 'show web form not found');
    expect(response.status()).toBe(404);
  });

  test('update web form', async ({ webFormService }) => {
    const createResponse = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    const { data } = await createResponse.json();

    const response = await webFormService.update(data.id, { title: unique('WebForm') });
    await logResponseOnFailure(response, 'update web form');
    expect(response.status()).toBe(200);
  });

  test('update web form with empty payload', async ({ webFormService }) => {
    const createResponse = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    const { data } = await createResponse.json();

    const response = await webFormService.update(data.id, {});
    await logResponseOnFailure(response, 'update web form with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete web form', async ({ webFormService }) => {
    const createResponse = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    const { data } = await createResponse.json();

    const response = await webFormService.delete(data.id);
    await logResponseOnFailure(response, 'delete web form');
    expect(response.status()).toBe(200);
  });

  test('delete web form not found', async ({ webFormService }) => {
    const response = await webFormService.delete(999999);
    await logResponseOnFailure(response, 'delete web form not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/web-forms/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue76: create web form with only title is rejected', async ({ webFormService }) => {
    const response = await webFormService.create({ title: unique('WebForm') });
    await logResponseOnFailure(response, 'issue76: create web form with only title is rejected');
    expect(response.status()).toBe(422);
  });

  test('issue77: list web forms with invalid sort parameter', async ({ webFormService }) => {
    const response = await webFormService.client.get('/api/v1/settings/web-forms', {
      params: { sort: 'bogus' },
    });
    await logResponseOnFailure(response, 'issue77: list web forms with invalid sort parameter');
    expect(response.status()).toBe(422);
  });

  test('issue78: update web form with valid payload', async ({ webFormService }) => {
    const createResponse = await webFormService.create({
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Thanks',
      attributes: [],
    });
    const { data } = await createResponse.json();

    const response = await webFormService.update(data.id, {
      title: unique('WebForm'),
      submit_button_label: 'Submit',
      submit_success_action: 'message',
      submit_success_content: 'Updated',
      attributes: [],
    });
    await logResponseOnFailure(response, 'issue78: update web form with valid payload');
    expect(response.status()).toBe(200);
  });

  test('issue79: show web form with invalid id', async ({ webFormService }) => {
    const response = await webFormService.getById(999999);
    await logResponseOnFailure(response, 'issue79: show web form with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue80: delete web form with invalid id', async ({ webFormService }) => {
    const response = await webFormService.delete(999999);
    await logResponseOnFailure(response, 'issue80: delete web form with invalid id');
    expect(response.status()).toBe(404);
  });
});
