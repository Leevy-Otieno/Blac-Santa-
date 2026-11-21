import type { LiveChatChannelMode } from "../features/shop-discussion/components/live-chat-panel";
import type { DiscussionViewMode } from "../features/shop-discussion/components/shop-discussion-dialog";
import type { ThreadSortMode } from "../features/shop-discussion/types/shop-discussion.types";

export type MarketplaceSortBy =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface MarketplaceFilterState {
  searchQuery: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: MarketplaceSortBy;
  selectedShopId: string | null;
  taggedShopId: string | null;
  discussionMode: DiscussionViewMode;
  liveChatChannel: LiveChatChannelMode;
  threadSortMode: ThreadSortMode;
}

const DEFAULT_FILTER_STATE: MarketplaceFilterState = {
  searchQuery: "",
  category: "all",
  minPrice: null,
  maxPrice: null,
  sortBy: "featured",
  selectedShopId: null,
  taggedShopId: null,
  discussionMode: "thread",
  liveChatChannel: "room",
  threadSortMode: "top",
};

type FilterListener = (state: MarketplaceFilterState) => void;

class FilterStore {
  private state: MarketplaceFilterState = { ...DEFAULT_FILTER_STATE };
  private listeners = new Set<FilterListener>();

  getState(): MarketplaceFilterState {
    return this.state;
  }

  subscribe(listener: FilterListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setState(
    updater:
      | Partial<MarketplaceFilterState>
      | ((prev: MarketplaceFilterState) => MarketplaceFilterState),
  ): void {
    this.state =
      typeof updater === "function"
        ? updater(this.state)
        : { ...this.state, ...updater };
    this.emit();
  }

  setSearchQuery(searchQuery: string): void {
    this.setState({ searchQuery });
  }

  setCategory(category: string): void {
    this.setState({ category: category || "all" });
  }

  setPriceRange(minPrice: number | null, maxPrice: number | null): void {
    this.setState({ minPrice, maxPrice });
  }

  setSortBy(sortBy: MarketplaceSortBy): void {
    this.setState({ sortBy });
  }

  setSelectedShopId(selectedShopId: string | null): void {
    this.setState({ selectedShopId });
  }

  setTaggedShopId(taggedShopId: string | null): void {
    this.setState({ taggedShopId });
  }

  setDiscussionPreferences(params: {
    discussionMode?: DiscussionViewMode;
    liveChatChannel?: LiveChatChannelMode;
    threadSortMode?: ThreadSortMode;
  }): void {
    this.setState({
      discussionMode: params.discussionMode ?? this.state.discussionMode,
      liveChatChannel: params.liveChatChannel ?? this.state.liveChatChannel,
      threadSortMode: params.threadSortMode ?? this.state.threadSortMode,
    });
  }

  resetFilters(): void {
    this.state = { ...DEFAULT_FILTER_STATE };
    this.emit();
  }
}

export const filterStore = new FilterStore();
export default filterStore;
