import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Sources API', () => {
  test('list sources without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/sources');
    await logResponseOnFailure(response, 'list sources without token');
    expect(response.status()).toBe(401);
  });

  test('list sources', async ({ sourceService }) => {
    const response = await sourceService.list();
    await logResponseOnFailure(response, 'list sources');
    expect(response.status()).toBe(200);
  });

  test('create source', async ({ sourceService }) => {
    const response = await sourceService.create({ name: unique('Source') });
    await logResponseOnFailure(response, 'create source');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create source with empty payload', async ({ sourceService }) => {
    const response = await sourceService.create({});
    await logResponseOnFailure(response, 'create source with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show source', async ({ sourceService }) => {
    const createResponse = await sourceService.create({ name: unique('Source') });
    const { data } = await createResponse.json();

    const response = await sourceService.getById(data.id);
    await logResponseOnFailure(response, 'show source');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show source not found', async ({ sourceService }) => {
    const response = await sourceService.getById(999999);
    await logResponseOnFailure(response, 'show source not found');
    expect(response.status()).toBe(404);
  });

  test('update source', async ({ sourceService }) => {
    const createResponse = await sourceService.create({ name: unique('Source') });
    const { data } = await createResponse.json();

    const response = await sourceService.update(data.id, { name: unique('Source') });
    await logResponseOnFailure(response, 'update source');
    expect(response.status()).toBe(200);
  });

  test('update source with empty payload', async ({ sourceService }) => {
    const createResponse = await sourceService.create({ name: unique('Source') });
    const { data } = await createResponse.json();

    const response = await sourceService.update(data.id, {});
    await logResponseOnFailure(response, 'update source with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete source', async ({ sourceService }) => {
    const createResponse = await sourceService.create({ name: unique('Source') });
    const { data } = await createResponse.json();

    const response = await sourceService.delete(data.id);
    await logResponseOnFailure(response, 'delete source');
    expect(response.status()).toBe(200);
  });

  test('delete source not found', async ({ sourceService }) => {
    const response = await sourceService.delete(999999);
    await logResponseOnFailure(response, 'delete source not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/sources/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue110: list sources with invalid sort parameter', async ({ sourceService }) => {
    const response = await sourceService.client.get('/api/v1/settings/sources', {
      params: { sort: 'bogus' },
    });
    await logResponseOnFailure(response, 'issue110: list sources with invalid sort parameter');
    expect(response.status()).toBe(422);
  });

  test('issue111: show source with invalid id', async ({ sourceService }) => {
    const response = await sourceService.getById(999999);
    await logResponseOnFailure(response, 'issue111: show source with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue112: create source with duplicate name', async ({ sourceService }) => {
    const name = unique('Source');
    await sourceService.create({ name });
    const response = await sourceService.create({ name });
    await logResponseOnFailure(response, 'issue112: create source with duplicate name');
    expect(response.status()).toBe(422);
  });

  test('issue114: delete source with invalid id', async ({ sourceService }) => {
    const response = await sourceService.delete(999999);
    await logResponseOnFailure(response, 'issue114: delete source with invalid id');
    expect(response.status()).toBe(404);
  });
});
