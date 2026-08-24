import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Groups API', () => {
  test('list groups without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/groups');
    await logResponseOnFailure(response, 'list groups without token');
    expect(response.status()).toBe(401);
  });

  test('list groups', async ({ groupService }) => {
    const response = await groupService.list();
    await logResponseOnFailure(response, 'list groups');
    expect(response.status()).toBe(200);
  });

  test('create group', async ({ groupService }) => {
    const response = await groupService.create({
      name: unique('Group'),
      description: 'Group description',
    });
    await logResponseOnFailure(response, 'create group');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create group with empty payload', async ({ groupService }) => {
    const response = await groupService.create({});
    await logResponseOnFailure(response, 'create group with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show group', async ({ groupService }) => {
    const createResponse = await groupService.create({
      name: unique('Group'),
      description: 'Group description',
    });
    const { data } = await createResponse.json();

    const response = await groupService.getById(data.id);
    await logResponseOnFailure(response, 'show group');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show group not found', async ({ groupService }) => {
    const response = await groupService.getById(999999);
    await logResponseOnFailure(response, 'show group not found');
    expect(response.status()).toBe(404);
  });

  test('update group', async ({ groupService }) => {
    const createResponse = await groupService.create({
      name: unique('Group'),
      description: 'Group description',
    });
    const { data } = await createResponse.json();

    const response = await groupService.update(data.id, { name: unique('Group') });
    await logResponseOnFailure(response, 'update group');
    expect(response.status()).toBe(200);
  });

  test('update group with empty payload', async ({ groupService }) => {
    const createResponse = await groupService.create({
      name: unique('Group'),
      description: 'Group description',
    });
    const { data } = await createResponse.json();

    const response = await groupService.update(data.id, {});
    await logResponseOnFailure(response, 'update group with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete group', async ({ groupService }) => {
    const createResponse = await groupService.create({
      name: unique('Group'),
      description: 'Group description',
    });
    const { data } = await createResponse.json();

    const response = await groupService.delete(data.id);
    await logResponseOnFailure(response, 'delete group');
    expect(response.status()).toBe(200);
  });

  test('delete group not found', async ({ groupService }) => {
    const response = await groupService.delete(999999);
    await logResponseOnFailure(response, 'delete group not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/groups/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue81: list groups with invalid sort parameter', async ({ groupService }) => {
    const response = await groupService.client.get('/api/v1/settings/groups', {
      params: { sort: 'bogus' },
    });
    await logResponseOnFailure(response, 'issue81: list groups with invalid sort parameter');
    expect(response.status()).toBe(422);
  });

  test('issue82: create group with duplicate name', async ({ groupService }) => {
    const name = unique('Group');
    await groupService.create({ name, description: 'Description' });
    const response = await groupService.create({ name, description: 'Description' });
    await logResponseOnFailure(response, 'issue82: create group with duplicate name');
    expect(response.status()).toBe(422);
  });

  test('issue83: show group with invalid id', async ({ groupService }) => {
    const response = await groupService.getById(999999);
    await logResponseOnFailure(response, 'issue83: show group with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue84: update group with empty description', async ({ groupService }) => {
    const createResponse = await groupService.create({
      name: unique('Group'),
      description: 'Description',
    });
    const { data } = await createResponse.json();

    const response = await groupService.update(data.id, { description: '' });
    await logResponseOnFailure(response, 'issue84: update group with empty description');
    expect(response.status()).toBe(422);
  });

  test('issue85: update group with invalid id', async ({ groupService }) => {
    const response = await groupService.update(999999, { name: unique('Group') });
    await logResponseOnFailure(response, 'issue85: update group with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue86: delete group with invalid id', async ({ groupService }) => {
    const response = await groupService.delete(999999);
    await logResponseOnFailure(response, 'issue86: delete group with invalid id');
    expect(response.status()).toBe(404);
  });
});
