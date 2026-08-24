import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Tags API', () => {
  test('list tags without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/tags');
    await logResponseOnFailure(response, 'list tags without token');
    expect(response.status()).toBe(401);
  });

  test('list tags', async ({ tagService }) => {
    const response = await tagService.list();
    await logResponseOnFailure(response, 'list tags');
    expect(response.status()).toBe(200);
  });

  test('create tag', async ({ tagService }) => {
    const response = await tagService.create({ name: unique('Tag') });
    await logResponseOnFailure(response, 'create tag');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create tag with empty payload', async ({ tagService }) => {
    const response = await tagService.create({});
    await logResponseOnFailure(response, 'create tag with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show tag', async ({ tagService }) => {
    const createResponse = await tagService.create({ name: unique('Tag') });
    const { data } = await createResponse.json();

    const response = await tagService.getById(data.id);
    await logResponseOnFailure(response, 'show tag');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show tag not found', async ({ tagService }) => {
    const response = await tagService.getById(999999);
    await logResponseOnFailure(response, 'show tag not found');
    expect(response.status()).toBe(404);
  });

  test('update tag', async ({ tagService }) => {
    const createResponse = await tagService.create({ name: unique('Tag') });
    const { data } = await createResponse.json();

    const response = await tagService.update(data.id, { name: unique('Tag') });
    await logResponseOnFailure(response, 'update tag');
    expect(response.status()).toBe(200);
  });

  test('update tag with empty payload', async ({ tagService }) => {
    const createResponse = await tagService.create({ name: unique('Tag') });
    const { data } = await createResponse.json();

    const response = await tagService.update(data.id, {});
    await logResponseOnFailure(response, 'update tag with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete tag', async ({ tagService }) => {
    const createResponse = await tagService.create({ name: unique('Tag') });
    const { data } = await createResponse.json();

    const response = await tagService.delete(data.id);
    await logResponseOnFailure(response, 'delete tag');
    expect(response.status()).toBe(200);
  });

  test('delete tag not found', async ({ tagService }) => {
    const response = await tagService.delete(999999);
    await logResponseOnFailure(response, 'delete tag not found');
    expect(response.status()).toBe(404);
  });

  test('create duplicate tag name', async ({ tagService }) => {
    const name = unique('Tag');
    await tagService.create({ name });
    const response = await tagService.create({ name });
    await logResponseOnFailure(response, 'create duplicate tag name');
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.errors.name[0]).toContain('already been taken');
  });

  test('search tags', async ({ tagService }) => {
    const response = await tagService.search('Tag');
    await logResponseOnFailure(response, 'search tags');
    expect(response.status()).toBe(200);
  });

  test('mass destroy tags', async ({ tagService }) => {
    const createResponse = await tagService.create({ name: unique('Tag') });
    const { data } = await createResponse.json();

    const response = await tagService.massDestroy([data.id]);
    await logResponseOnFailure(response, 'mass destroy tags');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.message).toBeTruthy();
  });

  test('mass destroy tags with missing indices', async ({ tagService }) => {
    const response = await tagService.client.post('/api/v1/settings/tags/mass-destroy', {
      data: {},
    });
    await logResponseOnFailure(response, 'mass destroy tags with missing indices');
    expect(response.status()).toBe(422);
  });

  test('mass update tags not supported', async ({ tagService }) => {
    const response = await tagService.massUpdateNotSupported();
    await logResponseOnFailure(response, 'mass update tags not supported');
    expect(response.status()).toBe(405);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/tags/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue30: show tag with invalid id', async ({ tagService }) => {
    const response = await tagService.getById(999999);
    await logResponseOnFailure(response, 'issue30: show tag with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue39: mass destroy tags with invalid ids', async ({ tagService }) => {
    const response = await tagService.massDestroy([999999]);
    await logResponseOnFailure(response, 'issue39: mass destroy tags with invalid ids');
    expect(response.status()).toBe(404);
  });

  test('issue67: configuration with invalid locale', async ({ authedApi }) => {
    const response = await authedApi.post('/api/v1/configuration/general', {
      data: { locale: 'bogus-locale' },
    });
    await logResponseOnFailure(response, 'issue67: configuration with invalid locale');
    expect(response.status()).toBe(422);
  });
});
