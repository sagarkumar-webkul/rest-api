import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Attributes API', () => {
  test('list attributes without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/attributes');
    await logResponseOnFailure(response, 'list attributes without token');
    expect(response.status()).toBe(401);
  });

  test('list attributes', async ({ attributeService }) => {
    const response = await attributeService.list();
    await logResponseOnFailure(response, 'list attributes');
    expect(response.status()).toBe(200);
  });

  test('create attribute', async ({ attributeService }) => {
    const response = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
    });
    await logResponseOnFailure(response, 'create attribute');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create attribute with empty payload', async ({ attributeService }) => {
    const response = await attributeService.create({});
    await logResponseOnFailure(response, 'create attribute with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show attribute', async ({ attributeService }) => {
    const createResponse = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
    });
    const { data } = await createResponse.json();

    const response = await attributeService.getById(data.id);
    await logResponseOnFailure(response, 'show attribute');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show attribute not found', async ({ attributeService }) => {
    const response = await attributeService.getById(999999);
    await logResponseOnFailure(response, 'show attribute not found');
    expect(response.status()).toBe(404);
  });

  test('update attribute', async ({ attributeService }) => {
    const createResponse = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
    });
    const { data } = await createResponse.json();

    const response = await attributeService.update(data.id, { name: unique('Attribute') });
    await logResponseOnFailure(response, 'update attribute');
    expect(response.status()).toBe(422);  
  });

  test('update attribute with empty payload', async ({ attributeService }) => {
    const createResponse = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
    });
    const { data } = await createResponse.json();

    const response = await attributeService.update(data.id, {});
    await logResponseOnFailure(response, 'update attribute with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete attribute', async ({ attributeService }) => {
    const createResponse = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
    });
    const { data } = await createResponse.json();

    const response = await attributeService.delete(data.id);
    await logResponseOnFailure(response, 'delete attribute');
    expect(response.ok()).toBeTruthy();
  });

  test('delete attribute not found', async ({ attributeService }) => {
    const response = await attributeService.delete(999999);
    await logResponseOnFailure(response, 'delete attribute not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/attributes/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue115: list attributes with invalid sort parameter', async ({ attributeService }) => {
    const response = await attributeService.client.get('/api/v1/settings/attributes', {
      params: { sort: 'bogus' },
    });
    await logResponseOnFailure(response, 'issue115: list attributes with invalid sort parameter');
    expect(response.status()).toBe(422);
  });

  test('issue116: create attribute with invalid lookup type', async ({ attributeService }) => {
    const response = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'lookup',
      entity_type: 'leads',
      lookup_type: 'bogus',
    });
    await logResponseOnFailure(response, 'issue116: create attribute with invalid lookup type');
    expect(response.status()).toBe(422);
  });

  test('issue117: create attribute with invalid entity type', async ({ attributeService }) => {
    const response = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'bogus',
    });
    await logResponseOnFailure(response, 'issue117: create attribute with invalid entity type');
    expect(response.status()).toBe(422);
  });

  test('issue118: create attribute with non-boolean flags', async ({ attributeService }) => {
    const response = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'text',
      entity_type: 'leads',
      is_required: 'yes',
      is_unique: 'maybe',
    });
    await logResponseOnFailure(response, 'issue118: create attribute with non-boolean flags');
    expect(response.status()).toBe(422);
  });

  test('issue119: create attribute with invalid type', async ({ attributeService }) => {
    const response = await attributeService.create({
      code: unique('attr'),
      name: unique('Attribute'),
      type: 'bogus-type',
      entity_type: 'leads',
    });
    await logResponseOnFailure(response, 'issue119: create attribute with invalid type');
    expect(response.status()).toBe(422);
  });

  test('issue120: show attribute with invalid id', async ({ attributeService }) => {
    const response = await attributeService.getById(999999);
    await logResponseOnFailure(response, 'issue120: show attribute with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue121: update attribute with invalid id', async ({ attributeService }) => {
    const response = await attributeService.update(999999, { name: unique('Attribute') });
    await logResponseOnFailure(response, 'issue121: update attribute with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue123: delete attribute with invalid id', async ({ attributeService }) => {
    const response = await attributeService.delete(999999);
    await logResponseOnFailure(response, 'issue123: delete attribute with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue124: mass destroy attributes with invalid ids', async ({ attributeService }) => {
    const response = await attributeService.massDestroy([999999]);
    await logResponseOnFailure(response, 'issue124: mass destroy attributes with invalid ids');
    expect(response.status()).toBe(404);
  });

  test('issue126: delete default attribute', async ({ attributeService }) => {
    const response = await attributeService.delete(1);
    await logResponseOnFailure(response, 'issue126: delete default attribute');
    expect(response.status()).toBe(404);
  });
});
