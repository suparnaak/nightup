import { Container } from "inversify";
import TYPES from "./types"

// -- Controllers & their interfaces --

import { AdminController }           from "../../controllers/adminController";
import { IAdminController }          from "../../controllers/interfaces/IAdminController";
import { BookingController }         from "../../controllers/bookingController";
import { IBookingController }        from "../../controllers/interfaces/IBookingController";
import { CategoryController }        from "../../controllers/categoryController";
import { ICategoryController }       from "../../controllers/interfaces/ICategoryController";
import { ChatController }            from "../../controllers/chatController";
import { IChatController }           from "../../controllers/interfaces/IChatController";
import { CouponController }          from "../../controllers/CouponController";
import { ICouponController }         from "../../controllers/interfaces/ICouponController";
import { EventController }           from "../../controllers/eventController";
import { IEventController }          from "../../controllers/interfaces/IEventController";
import { HostController }            from "../../controllers/hostController";
import { IHostController }           from "../../controllers/interfaces/IHostController";
import { HostProfileController }     from "../../controllers/hostProfileController";
import { IHostProfileController }    from "../../controllers/interfaces/IHostProfileController";
import { HostRevenueController }     from "../../controllers/hostRevenueController";
import { IHostRevenueController }    from "../../controllers/interfaces/IHostRevenueController";
import { HostSubscriptionController }    from "../../controllers/hostSubscriptionController";
import { IHostSubscriptionController }   from "../../controllers/interfaces/IHostSubscriptionController";
import { RevenueController }     from "../../controllers/revenueController";
import { IRevenueController }    from "../../controllers/interfaces/IRevenueController";
import { ReviewController }     from "../../controllers/reviewController";
import { IReviewController }    from "../../controllers/interfaces/IReviewController";
import { SavedEventController }      from "../../controllers/savedEventController";
import { ISavedEventController }     from "../../controllers/interfaces/ISavedEventController";
import { SubscriptionController }    from "../../controllers/subscriptionController";
import { ISubscriptionController }   from "../../controllers/interfaces/ISubscriptionController";
import { UserController }            from "../../controllers/userController";
import { IUserController }           from "../../controllers/interfaces/IUserController";
import { UserProfileController }     from "../../controllers/userProfileController";
import { IUserProfileController }    from "../../controllers/interfaces/IUserProfileController";
import { WalletController }          from "../../controllers/walletController";
import { IWalletController }         from "../../controllers/interfaces/IWalletController";

// Services & Interfaces
import { AdminService }              from "../../services/adminSerivce"
import { IAdminService }             from "../../services/interfaces/IAdminService";
import { BookingService }            from "../../services/bookingService";
import { IBookingService }           from "../../services/interfaces/IBookingService";
import { CategoryService }           from "../../services/categoryService";
import { ICategoryService }          from "../../services/interfaces/ICategoryService";
import { ChatService }               from "../../services/chatService";
import { IChatService }              from "../../services/interfaces/IChatService";
import { CouponService }             from "../../services/couponService";
import { ICouponService }            from "../../services/interfaces/ICouponService";
import { EventService }              from "../../services/eventService";
import { IEventService }             from "../../services/interfaces/IEventService";
import { HostService }               from "../../services/hostService";
import { IHostService }              from "../../services/interfaces/IHostService";
import { HostProfileService }        from "../../services/hostProfileService";
import { IHostProfileService }       from "../../services/interfaces/IHostProfileService";
import { HostRevenueService }        from "../../services/hostRevenueService";
import { IHostRevenueService }       from "../../services/interfaces/IHostRevenueService";
import { SubscriptionService }       from "../../services/subscriptionService";
import { ISubscriptionService }      from "../../services/interfaces/ISubscriptionService";
import { UserService }               from "../../services/userService";
import { IUserService }              from "../../services/interfaces/IUserService";
import { UserProfileService }        from "../../services/userProfileService";
import { IUserProfileService }       from "../../services/interfaces/IUserProfileService";
import { WalletService }             from "../../services/walletService";
import { IWalletService }            from "../../services/interfaces/IWalletSevice"
import { PaymentService }            from "../../services/paymentService";
import { IPaymentService }           from "../../services/interfaces/IPaymentService";
import { RevenueService }            from "../../services/revenueService";
import { IRevenueService }           from "../../services/interfaces/IRevenueService";
import { ReviewService }             from "../../services/reviewService";
import { IReviewService }            from "../../services/interfaces/IReviewService";
import { SavedEventService }         from "../../services/savedEventService";
import { ISavedEventService }        from "../../services/interfaces/ISavedEventService";



// Repositories & Interfaces
import { AdminRepository }           from "../../repositories/adminRepository";
import { IAdminRepository }          from "../../repositories/interfaces/IAdminRepository";
import { BookingRepository }         from "../../repositories/bookingRepository";
import { IBookingRepository }        from "../../repositories/interfaces/IBookingRepository";
import { CategoryRepository }        from "../../repositories/categoryRepository";
import { ICategoryRepository }       from "../../repositories/interfaces/ICategoryRepository";
import { ChatRepository }            from "../../repositories/chatRepository";
import { IChatRepository }           from "../../repositories/interfaces/IChatRepository";
import { CouponRepository }          from "../../repositories/couponRepository";
import { ICouponRepository }         from "../../repositories/interfaces/ICouponRepository";
import { EventRepository }           from "../../repositories/eventRepository";
import { IEventRepository }          from "../../repositories/interfaces/IEventRepository";
import { HostRepository }            from "../../repositories/hostRepository";
import { IHostRepository }           from "../../repositories/interfaces/IHostRepository";
import { HostRevenueRepository }     from "../../repositories/hostRevenueRepository";
import { IHostRevenueRepository }    from "../../repositories/interfaces/IHostRevenueRepository";
import { HostSubscriptionRepository }    from "../../repositories/hostSubscriptionRepository";
import { IHostSubscriptionRepository }   from "../../repositories/interfaces/IHostSubscriptionRepository";
import { SubscriptionRepository }    from "../../repositories/subscriptionRepository";
import { ISubscriptionRepository }   from "../../repositories/interfaces/ISubscriptionRepository";
import { RevenueRepository }         from "../../repositories/revenueRepository";
import { IRevenueRepository }        from "../../repositories/interfaces/IRevenueRepository";
import { ReviewRepository }         from "../../repositories/reviewRepository";
import { IReviewRepository }        from "../../repositories/interfaces/IReviewRepository";
import { SavedEventRepository }         from "../../repositories/savedEventRepository";
import { ISavedEventRepository }        from "../../repositories/interfaces/ISavedEventRepository";
import { UserRepository }            from "../../repositories/userRepository";
import { IUserRepository }           from "../../repositories/interfaces/IUserRepository";
import { WalletRepository }          from "../../repositories/walletRepository";
import { IWalletRepository }         from "../../repositories/interfaces/IWalletRepository";
import { IHostSubscriptionService } from "../../services/interfaces/IHostSubscriptionService";
import { HostSubscriptionService } from "../../services/hostSubscriptionService";

// Create the container
const container = new Container();

// Bind Controllers
container.bind<IAdminController>(TYPES.AdminController).to(AdminController);
container.bind<IBookingController>(TYPES.BookingController).to(BookingController);
container.bind<ICategoryController>(TYPES.CategoryController).to(CategoryController);
container.bind<IChatController>(TYPES.ChatController).to(ChatController);
container.bind<ICouponController>(TYPES.CouponController).to(CouponController);
container.bind<IEventController>(TYPES.EventController).to(EventController);
container.bind<IHostController>(TYPES.HostController).to(HostController);
container.bind<IHostProfileController>(TYPES.HostProfileController).to(HostProfileController);
container.bind<IHostRevenueController>(TYPES.HostRevenueController).to(HostRevenueController);
container.bind<IHostSubscriptionController>(TYPES.HostSubscriptionController).to(HostSubscriptionController);
container.bind<IRevenueController>(TYPES.RevenueController).to(RevenueController);
container.bind<IReviewController>(TYPES.ReviewController).to(ReviewController);
container.bind<ISavedEventController>(TYPES.SavedEventController).to(SavedEventController);
container.bind<ISubscriptionController>(TYPES.SubscriptionController).to(SubscriptionController);
container.bind<IUserController>(TYPES.UserController).to(UserController);
container.bind<IUserProfileController>(TYPES.UserProfileController).to(UserProfileController);
container.bind<IWalletController>(TYPES.WalletController).to(WalletController);

// Bind Services
container.bind<IAdminService>(TYPES.AdminService).to(AdminService);
container.bind<IBookingService>(TYPES.BookingService).to(BookingService);
container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind<ICouponService>(TYPES.CouponService).to(CouponService);
container.bind<IEventService>(TYPES.EventService).to(EventService);
container.bind<IHostService>(TYPES.HostService).to(HostService);
container.bind<IHostProfileService>(TYPES.HostProfileService).
 to(HostProfileService);
container.bind<IHostRevenueService>(TYPES.HostRevenueService).
 to(HostRevenueService);
container.bind<ISubscriptionService>(TYPES.SubscriptionService).to(SubscriptionService);
container.bind<IHostSubscriptionService>(TYPES.HostSubscriptionService).to(HostSubscriptionService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IUserProfileService>(TYPES.UserProfileService).to(UserProfileService);
container.bind<IWalletService>(TYPES.WalletService).to(WalletService);
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<IRevenueService>(TYPES.RevenueService).to(RevenueService);
container.bind<IReviewService>(TYPES.ReviewService).to(ReviewService);
container.bind<ISavedEventService>(TYPES.SavedEventService).to(SavedEventService);

// Bind Repositories
container.bind<IAdminRepository>(TYPES.AdminRepository).to(AdminRepository);
container.bind<IBookingRepository>(TYPES.BookingRepository).to(BookingRepository);
container.bind<ICategoryRepository>(TYPES.CategoryRepository).to(CategoryRepository);
container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatRepository);
container.bind<ICouponRepository>(TYPES.CouponRepository).to(CouponRepository);
container.bind<IEventRepository>(TYPES.EventRepository).to(EventRepository);
container.bind<IHostRepository>(TYPES.HostRepository).to(HostRepository);
container.bind<IHostRevenueRepository>(TYPES.HostRevenueRepository).to(HostRevenueRepository);
container.bind<IHostSubscriptionRepository>(TYPES.HostSubscriptionRepository).to(HostSubscriptionRepository);
container.bind<ISubscriptionRepository>(TYPES.SubscriptionRepository).to(SubscriptionRepository);
container.bind<IRevenueRepository>(TYPES.RevenueRepository).to(RevenueRepository);
container.bind<IReviewRepository>(TYPES.ReviewRepository).to(ReviewRepository);
container.bind<ISavedEventRepository>(TYPES.SavedEventRepository).to(SavedEventRepository);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IWalletRepository>(TYPES.WalletRepository).to(WalletRepository);

export default container;