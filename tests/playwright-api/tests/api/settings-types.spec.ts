import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Types API', () => {
  test('list types without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/types');
    await logResponseOnFailure(response, 'list types without token');
    expect(response.status()).toBe(401);
  });

  test('list types', async ({ typeService }) => {
    const response = await typeService.list();
    await logResponseOnFailure(response, 'list types');
    expect(response.status()).toBe(200);
  });

  test('create type', async ({ typeService }) => {
    const response = await typeService.create({ name: unique('Type') });
    await logResponseOnFailure(response, 'create type');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create type with empty payload', async ({ typeService }) => {
    const response = await typeService.create({});
    await logResponseOnFailure(response, 'create type with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show type', async ({ typeService }) => {
    const createResponse = await typeService.create({ name: unique('Type') });
    const { data } = await createResponse.json();

    const response = await typeService.getById(data.id);
    await logResponseOnFailure(response, 'show type');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show type not found', async ({ typeService }) => {
    const response = await typeService.getById(999999);
    await logResponseOnFailure(response, 'show type not found');
    expect(response.status()).toBe(404);
  });

  test('update type', async ({ typeService }) => {
    const createResponse = await typeService.create({ name: unique('Type') });
    const { data } = await createResponse.json();

    const response = await typeService.update(data.id, { name: unique('Type') });
    await logResponseOnFailure(response, 'update type');
    expect(response.status()).toBe(200);
  });

  test('update type with empty payload', async ({ typeService }) => {
    const createResponse = await typeService.create({ name: unique('Type') });
    const { data } = await createResponse.json();

    const response = await typeService.update(data.id, {});
    await logResponseOnFailure(response, 'update type with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete type', async ({ typeService }) => {
    const createResponse = await typeService.create({ name: unique('Type') });
    const { data } = await createResponse.json();

    const response = await typeService.delete(data.id);
    await logResponseOnFailure(response, 'delete type');
    expect(response.status()).toBe(200);
  });

  test('delete type not found', async ({ typeService }) => {
    const response = await typeService.delete(999999);
    await logResponseOnFailure(response, 'delete type not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/types/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue133: show type with invalid id', async ({ typeService }) => {
    const response = await typeService.getById(999999);
    await logResponseOnFailure(response, 'issue133: show type with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue134: update type with invalid id', async ({ typeService }) => {
    const response = await typeService.update(999999, { name: unique('Type') });
    await logResponseOnFailure(response, 'issue134: update type with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue135: delete type with invalid id', async ({ typeService }) => {
    const response = await typeService.delete(999999);
    await logResponseOnFailure(response, 'issue135: delete type with invalid id');
    expect(response.status()).toBe(404);
  });
});
