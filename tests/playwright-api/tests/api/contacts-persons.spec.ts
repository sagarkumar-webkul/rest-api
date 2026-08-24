import { test, expect, unique, logResponseOnFailure } from '../../fixtures/api.fixture';
import { PersonService } from '../../services/ContactService';
import { TagService } from '../../services/TagService';

test.describe('Contacts Persons API', () => {
  async function createPerson(personService: PersonService): Promise<string> {
    const response = await personService.create({
      name: unique('Person'),
      emails: [{ value: unique('person') + '@example.com', label: 'work' }],
    });
    const body = await response.json();
    return String(body.data.id);
  }

  async function createTag(tagService: TagService): Promise<string> {
    const response = await tagService.create({ name: unique('Tag') });
    const body = await response.json();
    return String(body.data.id);
  }

  test('list persons without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/contacts/persons');
    await logResponseOnFailure(response, 'list persons without token');
    expect(response.status()).toBe(401);
  });

  test('list persons', async ({ personService }) => {
    const response = await personService.list();
    await logResponseOnFailure(response, 'list persons');
    expect(response.status()).toBe(200);
  });

  test('create person success', async ({ personService }) => {
    const response = await personService.create({
      name: unique('Person'),
      emails: [{ value: unique('person') + '@example.com', label: 'work' }],
    });

    await logResponseOnFailure(response, 'create person success');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.name).toBeTruthy();
    expect(body.message).toContain('created successfully');
  });

  test('create person with empty payload', async ({ personService }) => {
    const response = await personService.create({});
    await logResponseOnFailure(response, 'create person with empty payload');
    expect(response.status()).toBe(500);
  });

  test('create person with invalid email value', async ({ personService }) => {
    const response = await personService.create({
      name: 'Person',
      emails: [{ value: 'not-an-email', label: 'work' }],
    });
    await logResponseOnFailure(response, 'create person with invalid email value');
    expect(response.status()).toBe(422);
  });

  test('show person', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.getById(id);
    await logResponseOnFailure(response, 'show person');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(parseInt(id));
  });

  test('show person not found', async ({ personService }) => {
    const response = await personService.getById(999999);
    await logResponseOnFailure(response, 'show person not found');
    expect(response.status()).toBe(404);
  });

  test('update person', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.update(id, {
      name: unique('Person'),
      emails: [{ value: unique('person') + '@example.com', label: 'work' }],
    });
    await logResponseOnFailure(response, 'update person');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(parseInt(id));
  });

  test('update person with empty payload', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.update(id, {});
    await logResponseOnFailure(response, 'update person with empty payload');
    expect(response.status()).toBe(500);
  });

  test('delete person', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.delete(id);
    await logResponseOnFailure(response, 'delete person');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.message).toContain('deleted successfully');
  });

  test('delete person not found', async ({ personService }) => {
    const response = await personService.delete(999999);
    await logResponseOnFailure(response, 'delete person not found');
    expect(response.status()).toBe(404);
  });

  test('search persons', async ({ personService }) => {
    const response = await personService.search('new');
    await logResponseOnFailure(response, 'search persons');
    expect(response.status()).toBe(200);
  });

  test('export persons', async ({ personService }) => {
    const response = await personService.export();
    await logResponseOnFailure(response, 'export persons');
    expect(response.status()).toBe(200);
  });

  test('mass destroy persons', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.massDestroy([parseInt(id)]);
    await logResponseOnFailure(response, 'mass destroy persons');
    expect(response.status()).toBe(200);
  });

  test('mass destroy persons with missing indices', async ({ personService }) => {
    const response = await personService.massDestroy([]);
    await logResponseOnFailure(response, 'mass destroy persons with missing indices');
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.errors.indices[0]).toContain('required');
  });

  test('person activities', async ({ personService }) => {
    const id = await createPerson(personService);
    const response = await personService.getActivities(id);
    await logResponseOnFailure(response, 'person activities');
    expect(response.status()).toBe(200);
  });

  test('person attach tag', async ({ personService, tagService }) => {
    const personId = await createPerson(personService);
    const tagId = await createTag(tagService);
    const response = await personService.attachTag(personId, parseInt(tagId));
    await logResponseOnFailure(response, 'person attach tag');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('attached successfully');
  });

  test('person attach tag with missing tag id', async ({ personService }) => {
    const personId = await createPerson(personService);
    const response = await personService.attachTag(personId, undefined);
    await logResponseOnFailure(response, 'person attach tag with missing tag id');
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.errors.tag_id[0]).toContain('required');
  });

  test('person detach tag', async ({ personService, tagService }) => {
    const personId = await createPerson(personService);
    const tagId = await createTag(tagService);

    await personService.attachTag(personId, parseInt(tagId));

    const response = await personService.detachTag(personId, parseInt(tagId));
    await logResponseOnFailure(response, 'person detach tag');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('detached successfully');
  });

  test('person activities without token', async ({ apiClient }) => {
    const response = await apiClient.get('/api/v1/contacts/persons/1/activities');
    await logResponseOnFailure(response, 'person activities without token');
    expect(response.status()).toBe(401);
  });

  test('issue53: create duplicate person with same email is rejected', async ({ personService }) => {
    const email = unique('person') + '@example.com';
    await personService.create({
      name: unique('Person'),
      emails: [{ value: email, label: 'work' }],
    });
    const response = await personService.create({
      name: unique('Person'),
      emails: [{ value: email, label: 'work' }],
    });
    await logResponseOnFailure(response, 'issue53: create duplicate person with same email is rejected');
    expect(response.status()).toBe(422);
  });

  test('issue57: mass destroy persons with invalid ids', async ({ personService }) => {
    const response = await personService.massDestroy([999999]);
    await logResponseOnFailure(response, 'issue57: mass destroy persons with invalid ids');
    expect(response.status()).toBe(404);
  });

  test('issue58: attach tag with invalid id to person', async ({ personService }) => {
    const personId = await createPerson(personService);
    const response = await personService.attachTag(personId, 999999);
    await logResponseOnFailure(response, 'issue58: attach tag with invalid id to person');
    expect(response.status()).toBe(422);
  });

  test('issue59: detach tag not attached to person returns 404', async ({ personService }) => {
    const personId = await createPerson(personService);
    const response = await personService.detachTag(personId, 999999);
    await logResponseOnFailure(response, 'issue59: detach tag not attached to person returns 404');
    expect(response.status()).toBe(404);
  });

  test('issue22: person email sub-resource not present', async ({ personService }) => {
    const personId = await createPerson(personService);
    const response = await personService.client.post(`/api/v1/contacts/persons/${personId}/emails`, {
      data: { subject: 'Test' },
    });
    await logResponseOnFailure(response, 'issue22: person email sub-resource not present');
    expect(response.status()).toBe(404);
  });

  test('issue54: show person with invalid id', async ({ personService }) => {
    const response = await personService.getById(999999);
    await logResponseOnFailure(response, 'issue54: show person with invalid id');
    expect(response.status()).toBe(404);
  });

  test('issue55: delete person successfully', async ({ personService }) => {
    const personId = await createPerson(personService);
    const response = await personService.delete(personId);
    await logResponseOnFailure(response, 'issue55: delete person successfully');
    expect(response.status()).toBe(200);
  });
});
