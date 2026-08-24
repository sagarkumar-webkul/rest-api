import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';

test.describe('Settings Marketing Events API', () => {
  test('list events without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/settings/marketing/events');
    await logResponseOnFailure(response, 'list events without token');
    expect(response.status()).toBe(401);
  });

  test('list events', async ({ marketingEventService }) => {
    const response = await marketingEventService.list();
    await logResponseOnFailure(response, 'list events');
    expect(response.status()).toBe(200);
  });

  test('create event', async ({ marketingEventService }) => {
    const response = await marketingEventService.create({
      name: unique('Event'),
      description: 'Event description',
      date: '2027-01-01',
    });
    await logResponseOnFailure(response, 'create event');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
  });

  test('create event with empty payload', async ({ marketingEventService }) => {
    const response = await marketingEventService.create({});
    await logResponseOnFailure(response, 'create event with empty payload');
    expect(response.status()).toBe(422);
  });

  test('show event', async ({ marketingEventService }) => {
    const createResponse = await marketingEventService.create({
      name: unique('Event'),
      description: 'Event description',
      date: '2027-01-01',
    });
    const { data } = await createResponse.json();

    const response = await marketingEventService.getById(data.id);
    await logResponseOnFailure(response, 'show event');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(data.id);
  });

  test('show event not found', async ({ marketingEventService }) => {
    const response = await marketingEventService.getById(999999);
    await logResponseOnFailure(response, 'show event not found');
    expect(response.status()).toBe(404);
  });

  test('update event', async ({ marketingEventService }) => {
    const createResponse = await marketingEventService.create({
      name: unique('Event'),
      description: 'Event description',
      date: '2027-01-01',
    });
    const { data } = await createResponse.json();

    const response = await marketingEventService.update(data.id, { name: unique('Event') });
    await logResponseOnFailure(response, 'update event');
    expect(response.status()).toBe(200);
  });

  test('update event with empty payload', async ({ marketingEventService }) => {
    const createResponse = await marketingEventService.create({
      name: unique('Event'),
      description: 'Event description',
      date: '2027-01-01',
    });
    const { data } = await createResponse.json();

    const response = await marketingEventService.update(data.id, {});
    await logResponseOnFailure(response, 'update event with empty payload');
    expect(response.status()).toBe(422);
  });

  test('delete event', async ({ marketingEventService }) => {
    const createResponse = await marketingEventService.create({
      name: unique('Event'),
      description: 'Event description',
      date: '2027-01-01',
    });
    const { data } = await createResponse.json();

    const response = await marketingEventService.delete(data.id);
    await logResponseOnFailure(response, 'delete event');
    expect(response.status()).toBe(200);
  });

  test('delete event not found', async ({ marketingEventService }) => {
    const response = await marketingEventService.delete(999999);
    await logResponseOnFailure(response, 'delete event not found');
    expect(response.status()).toBe(404);
  });

  test('wrong http method', async ({ authedApi }) => {
    const response = await authedApi.patch('/api/v1/settings/marketing/events/1', { data: {} });
    await logResponseOnFailure(response, 'wrong http method');
    expect(response.status()).toBe(405);
  });

  test('issue152: show marketing event with invalid id', async ({ marketingEventService }) => {
    const response = await marketingEventService.getById(999999);
    await logResponseOnFailure(response, 'issue152: show marketing event with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue153: update marketing event with invalid id', async ({ marketingEventService }) => {
    const response = await marketingEventService.update(999999, { name: unique('Event') });
    await logResponseOnFailure(response, 'issue153: update marketing event with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue154: delete marketing event with invalid id', async ({ marketingEventService }) => {
    const response = await marketingEventService.delete(999999);
    await logResponseOnFailure(response, 'issue154: delete marketing event with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue155: mass destroy marketing events with invalid ids', async ({ marketingEventService }) => {
    const response = await marketingEventService.massDestroy([999999]);
    await logResponseOnFailure(response, 'issue155: mass destroy marketing events with invalid ids');
    expect(response.status()).toBe(404);
  });
});
