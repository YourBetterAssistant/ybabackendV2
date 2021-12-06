import { UnauthenticatedGuard } from './unauthenticated.guard';

describe('UnauthenticatedGuard', () => {
  it('should be defined', () => {
    expect(new UnauthenticatedGuard()).toBeDefined();
  });
});
