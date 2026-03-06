import { ChatUseCase, IChatRepository, ChatMessage } from "@/lib/chat/domain";

describe("ChatUseCase", () => {
  const repo: jest.Mocked<IChatRepository> = {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
    subscribeToMessages: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates sendMessage to repository", async () => {
    const useCase = new ChatUseCase(repo);
    repo.sendMessage.mockResolvedValue();

    await useCase.sendMessage("user", "Hello", "tester");

    expect(repo.sendMessage).toHaveBeenCalledWith({ from: "user", text: "Hello", username: "tester" });
  });

  it("delegates getMessages to repository", async () => {
    const useCase = new ChatUseCase(repo);
    const expected: ChatMessage[] = [{ id: "1", from: "user", text: "t", timestamp: Date.now() }];
    repo.getMessages.mockResolvedValue(expected);

    const result = await useCase.getMessages();

    expect(result).toEqual(expected);
  });

  it("delegates subscribeToMessages and returns unsubscribe function", () => {
    const useCase = new ChatUseCase(repo);
    const unsub = jest.fn();
    repo.subscribeToMessages.mockReturnValue(unsub);

    const returned = useCase.subscribeToMessages(() => undefined);

    expect(repo.subscribeToMessages).toHaveBeenCalled();
    expect(returned).toBe(unsub);
  });

  it("propagates sendMessage rejection", async () => {
    const useCase = new ChatUseCase(repo);
    repo.sendMessage.mockRejectedValue(new Error("send failed"));

    await expect(useCase.sendMessage("admin", "x")).rejects.toThrow("send failed");
  });
});
