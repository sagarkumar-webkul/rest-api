import { test as base, expect, APIResponse } from '@playwright/test';
import { ApiClient, unique, uniqueNumber, waitForNextSecond } from '../api/ApiClient';
import { config } from '../utils/config';
import {
  AuthService,
  LeadService,
  PersonService,
  OrganizationService,
  ProductService,
  QuoteService,
  ActivityService,
  MailService,
  TagService,
  RoleService,
  PipelineService,
  SourceService,
  TypeService,
  UserService,
  WarehouseService,
  GroupService,
  AttributeService,
  WebhookService,
  WorkflowService,
  EmailTemplateService,
  WebFormService,
  MarketingEventService,
  MarketingCampaignService,
} from '../services';

async function logResponseOnFailure(response: APIResponse, testName: string) {
  if (response.status() >= 400) {
    const body = await response.json().catch(() => null);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`FAILED: ${testName}`);
    console.log(`URL: ${response.url()}`);
    console.log(`Status: ${response.status()} ${response.statusText()}`);
    console.log(`Response Body:`, JSON.stringify(body, null, 2));
    console.log(`${'='.repeat(80)}\n`);
  }
}

type ApiFixtures = {
  apiClient: ApiClient;
  authedApi: ApiClient;
  apiToken: string;
  authService: AuthService;
  leadService: LeadService;
  personService: PersonService;
  organizationService: OrganizationService;
  productService: ProductService;
  quoteService: QuoteService;
  activityService: ActivityService;
  mailService: MailService;
  tagService: TagService;
  roleService: RoleService;
  pipelineService: PipelineService;
  sourceService: SourceService;
  typeService: TypeService;
  userService: UserService;
  warehouseService: WarehouseService;
  groupService: GroupService;
  attributeService: AttributeService;
  webhookService: WebhookService;
  workflowService: WorkflowService;
  emailTemplateService: EmailTemplateService;
  webFormService: WebFormService;
  marketingEventService: MarketingEventService;
  marketingCampaignService: MarketingCampaignService;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, { baseUrl: config.baseUrl });
    await use(client);
  },

  apiToken: async ({ request }, use) => {
    const response = await request.fetch(`${config.baseUrl}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        email: config.testUser.email,
        password: config.testUser.password,
        device_name: 'android',
      },
    });
    const body = await response.json();
    const token = body.token || '';

    console.log(`\n${'='.repeat(80)}`);
    console.log(`LOGIN RESPONSE:`);
    console.log(`Status: ${response.status()}`);
    console.log(`Token: ${token ? token.substring(0, 20) + '...' : 'N/A'}`);
    console.log(`${'='.repeat(80)}\n`);

    await use(token);
  },

  authedApi: async ({ request, apiToken }, use) => {
    const client = new ApiClient(request, {
      baseUrl: config.baseUrl,
      token: apiToken,
    });
    await use(client);
  },

  authService: async ({ apiClient }, use) => {
    await use(new AuthService(apiClient));
  },

  leadService: async ({ authedApi }, use) => {
    await use(new LeadService(authedApi));
  },

  personService: async ({ authedApi }, use) => {
    await use(new PersonService(authedApi));
  },

  organizationService: async ({ authedApi }, use) => {
    await use(new OrganizationService(authedApi));
  },

  productService: async ({ authedApi }, use) => {
    await use(new ProductService(authedApi));
  },

  quoteService: async ({ authedApi }, use) => {
    await use(new QuoteService(authedApi));
  },

  activityService: async ({ authedApi }, use) => {
    await use(new ActivityService(authedApi));
  },

  mailService: async ({ authedApi }, use) => {
    await use(new MailService(authedApi));
  },

  tagService: async ({ authedApi }, use) => {
    await use(new TagService(authedApi));
  },

  roleService: async ({ authedApi }, use) => {
    await use(new RoleService(authedApi));
  },

  pipelineService: async ({ authedApi }, use) => {
    await use(new PipelineService(authedApi));
  },

  sourceService: async ({ authedApi }, use) => {
    await use(new SourceService(authedApi));
  },

  typeService: async ({ authedApi }, use) => {
    await use(new TypeService(authedApi));
  },

  userService: async ({ authedApi }, use) => {
    await use(new UserService(authedApi));
  },

  warehouseService: async ({ authedApi }, use) => {
    await use(new WarehouseService(authedApi));
  },

  groupService: async ({ authedApi }, use) => {
    await use(new GroupService(authedApi));
  },

  attributeService: async ({ authedApi }, use) => {
    await use(new AttributeService(authedApi));
  },

  webhookService: async ({ authedApi }, use) => {
    await use(new WebhookService(authedApi));
  },

  workflowService: async ({ authedApi }, use) => {
    await use(new WorkflowService(authedApi));
  },

  emailTemplateService: async ({ authedApi }, use) => {
    await use(new EmailTemplateService(authedApi));
  },

  webFormService: async ({ authedApi }, use) => {
    await use(new WebFormService(authedApi));
  },

  marketingEventService: async ({ authedApi }, use) => {
    await use(new MarketingEventService(authedApi));
  },

  marketingCampaignService: async ({ authedApi }, use) => {
    await use(new MarketingCampaignService(authedApi));
  },
});

export { expect } from '@playwright/test';
export { unique, uniqueNumber, waitForNextSecond, logResponseOnFailure };
