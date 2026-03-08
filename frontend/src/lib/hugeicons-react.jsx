import { forwardRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Home01Icon as Home01IconSvg,
    Add01Icon as Add01IconSvg,
    Agreement01Icon as Agreement01IconSvg,
    Alert01Icon as Alert01IconSvg,
    Alert02Icon as Alert02IconSvg,
    AlertCircleIcon as AlertCircleIconSvg,
    ArrowDown01Icon as ArrowDown01IconSvg,
    ArrowLeft01Icon as ArrowLeft01IconSvg,
    ArrowLeft02Icon as ArrowLeft02IconSvg,
    ArrowRight01Icon as ArrowRight01IconSvg,
    ArrowUp01Icon as ArrowUp01IconSvg,
    ArrowUpRight01Icon as ArrowUpRight01IconSvg,
    BubbleChatIcon as BubbleChatIconSvg,
    Calendar01Icon as Calendar01IconSvg,
    Calendar03Icon as Calendar03IconSvg,
    Camera01Icon as Camera01IconSvg,
    Cancel01Icon as Cancel01IconSvg,
    Car01Icon as Car01IconSvg,
    ChampionIcon as ChampionIconSvg,
    ChartHistogramIcon as ChartHistogramIconSvg,
    Clock01Icon as Clock01IconSvg,
    Comment01Icon as Comment01IconSvg,
    DashboardSquare01Icon as DashboardSquare01IconSvg,
    DatabaseIcon as DatabaseIconSvg,
    Delete02Icon as Delete02IconSvg,
    Edit01Icon as Edit01IconSvg,
    File02Icon as File02IconSvg,
    FilterIcon as FilterIconSvg,
    Flag01Icon as Flag01IconSvg,
    FlashIcon as FlashIconSvg,
    Folder01Icon as Folder01IconSvg,
    GlobalIcon as GlobalIconSvg,
    GridIcon as Grid01IconSvg,
    HelpCircleIcon as HelpCircleIconSvg,
    Home09Icon as Home09IconSvg,
    Image01Icon as Image01IconSvg,
    InformationCircleIcon as InformationCircleIconSvg,
    Loading03Icon as Loading03IconSvg,
    Location01Icon as Location01IconSvg,
    Location04Icon as Location04IconSvg,
    LockIcon as LockIconSvg,
    Logout03Icon as Logout03IconSvg,
    Menu01Icon as Menu01IconSvg,
    Message01Icon as Message01IconSvg,
    MessageMultiple01Icon as MessageMultiple01IconSvg,
    MoneyReceiveSquareIcon as MoneyReceiveSquareIconSvg,
    Note01Icon as Note01IconSvg,
    PlayIcon as PlayIconSvg,
    RefreshIcon as RefreshIconSvg,
    Route01Icon as Route01IconSvg,
    Search01Icon as Search01IconSvg,
    SearchIcon as SearchIconSvg,
    Settings01Icon as Settings01IconSvg,
    SidebarLeft01Icon as SidebarLeft01IconSvg,
    Sorting01Icon as Sorting01IconSvg,
    StopIcon as StopIconSvg,
    TaskDone01Icon as TaskDone01IconSvg,
    TaskEdit01Icon as TaskEdit01IconSvg,
    ThumbsUpIcon as ThumbsUpIconSvg,
    Tick01Icon as Tick01IconSvg,
    Tick02Icon as Tick02IconSvg,
    UserCircleIcon as UserCircleIconSvg,
    UserIcon as UserIconSvg,
    UserMultiple02Icon as UserMultiple02IconSvg,
    ViewIcon as ViewIconSvg,
    ViewOffIcon as ViewOffIconSvg,
    WasteIcon as WasteIconSvg,
    LanguageSkillIcon as LanguageSkillIconSvg,
    Mic01Icon as Mic01IconSvg,
    RankingIcon as RankingIconSvg,
    SecurityCheckIcon as SecurityCheckIconSvg,
    SparklesIcon as SparklesIconSvg,
    SmartPhone01Icon as SmartPhone01IconSvg,
    Upload04Icon as Upload04IconSvg,
    Video01Icon as Video01IconSvg,
} from '@hugeicons/core-free-icons';

function createCompatIcon(icon, displayName) {
    const Component = forwardRef(function CompatHugeicon(
        { variant, size = 24, color = 'currentColor', strokeWidth, ...props },
        ref,
    ) {
        return (
            <HugeiconsIcon
                ref={ref}
                icon={icon}
                size={size}
                color={color}
                strokeWidth={strokeWidth}
                {...props}
            />
        );
    });

    Component.displayName = displayName;
    return Component;
}

export { HugeiconsIcon };

export const Add01Icon = createCompatIcon(Add01IconSvg, 'Add01Icon');
export const Agreement01Icon = createCompatIcon(Agreement01IconSvg, 'Agreement01Icon');
export const Alert01Icon = createCompatIcon(Alert01IconSvg, 'Alert01Icon');
export const Alert02Icon = createCompatIcon(Alert02IconSvg, 'Alert02Icon');
export const AlertCircleIcon = createCompatIcon(AlertCircleIconSvg, 'AlertCircleIcon');
export const ArrowDown01Icon = createCompatIcon(ArrowDown01IconSvg, 'ArrowDown01Icon');
export const ArrowLeft01Icon = createCompatIcon(ArrowLeft01IconSvg, 'ArrowLeft01Icon');
export const ArrowLeft02Icon = createCompatIcon(ArrowLeft02IconSvg, 'ArrowLeft02Icon');
export const ArrowRight01Icon = createCompatIcon(ArrowRight01IconSvg, 'ArrowRight01Icon');
export const ArrowUp01Icon = createCompatIcon(ArrowUp01IconSvg, 'ArrowUp01Icon');
export const ArrowUpRight01Icon = createCompatIcon(ArrowUpRight01IconSvg, 'ArrowUpRight01Icon');
export const BubbleChatIcon = createCompatIcon(BubbleChatIconSvg, 'BubbleChatIcon');
export const Calendar01Icon = createCompatIcon(Calendar01IconSvg, 'Calendar01Icon');
export const Calendar03Icon = createCompatIcon(Calendar03IconSvg, 'Calendar03Icon');
export const Camera01Icon = createCompatIcon(Camera01IconSvg, 'Camera01Icon');
export const Cancel01Icon = createCompatIcon(Cancel01IconSvg, 'Cancel01Icon');
export const Car01Icon = createCompatIcon(Car01IconSvg, 'Car01Icon');
export const ChampionIcon = createCompatIcon(ChampionIconSvg, 'ChampionIcon');
export const ChartHistogramIcon = createCompatIcon(ChartHistogramIconSvg, 'ChartHistogramIcon');
export const Clock01Icon = createCompatIcon(Clock01IconSvg, 'Clock01Icon');
export const Comment01Icon = createCompatIcon(Comment01IconSvg, 'Comment01Icon');
export const DashboardSquare01Icon = createCompatIcon(DashboardSquare01IconSvg, 'DashboardSquare01Icon');
export const DatabaseIcon = createCompatIcon(DatabaseIconSvg, 'DatabaseIcon');
export const Delete02Icon = createCompatIcon(Delete02IconSvg, 'Delete02Icon');
export const Edit01Icon = createCompatIcon(Edit01IconSvg, 'Edit01Icon');
export const File02Icon = createCompatIcon(File02IconSvg, 'File02Icon');
export const FilterIcon = createCompatIcon(FilterIconSvg, 'FilterIcon');
export const Flag01Icon = createCompatIcon(Flag01IconSvg, 'Flag01Icon');
export const FlashIcon = createCompatIcon(FlashIconSvg, 'FlashIcon');
export const Folder01Icon = createCompatIcon(Folder01IconSvg, 'Folder01Icon');
export const GlobalIcon = createCompatIcon(GlobalIconSvg, 'GlobalIcon');
export const Grid01Icon = createCompatIcon(Grid01IconSvg, 'Grid01Icon');
export const HelpCircleIcon = createCompatIcon(HelpCircleIconSvg, 'HelpCircleIcon');
export const HelpIcon = HelpCircleIcon;
export const Home09Icon = createCompatIcon(Home09IconSvg, 'Home09Icon');
export const Image01Icon = createCompatIcon(Image01IconSvg, 'Image01Icon');
export const InformationCircleIcon = createCompatIcon(InformationCircleIconSvg, 'InformationCircleIcon');
export const Loading03Icon = createCompatIcon(Loading03IconSvg, 'Loading03Icon');
export const Location01Icon = createCompatIcon(Location01IconSvg, 'Location01Icon');
export const Location04Icon = createCompatIcon(Location04IconSvg, 'Location04Icon');
export const LockIcon = createCompatIcon(LockIconSvg, 'LockIcon');
export const Logout03Icon = createCompatIcon(Logout03IconSvg, 'Logout03Icon');
export const Menu01Icon = createCompatIcon(Menu01IconSvg, 'Menu01Icon');
export const Message01Icon = createCompatIcon(Message01IconSvg, 'Message01Icon');
export const MessageMultiple01Icon = createCompatIcon(MessageMultiple01IconSvg, 'MessageMultiple01Icon');
export const MoneyReceiveSquareIcon = createCompatIcon(MoneyReceiveSquareIconSvg, 'MoneyReceiveSquareIcon');
export const Note01Icon = createCompatIcon(Note01IconSvg, 'Note01Icon');
export const PlayIcon = createCompatIcon(PlayIconSvg, 'PlayIcon');
export const RefreshIcon = createCompatIcon(RefreshIconSvg, 'RefreshIcon');
export const Route01Icon = createCompatIcon(Route01IconSvg, 'Route01Icon');
export const Search01Icon = createCompatIcon(Search01IconSvg, 'Search01Icon');
export const LanguageSkillIcon = createCompatIcon(LanguageSkillIconSvg, 'LanguageSkillIcon');
export const Mic01Icon = createCompatIcon(Mic01IconSvg, 'Mic01Icon');
export const RankingIcon = createCompatIcon(RankingIconSvg, 'RankingIcon');
export const SearchIcon = createCompatIcon(SearchIconSvg, 'SearchIcon');
export const SecurityCheckIcon = createCompatIcon(SecurityCheckIconSvg, 'SecurityCheckIcon');
export const Settings01Icon = createCompatIcon(Settings01IconSvg, 'Settings01Icon');
export const SidebarLeft01Icon = createCompatIcon(SidebarLeft01IconSvg, 'SidebarLeft01Icon');
export const Sorting01Icon = createCompatIcon(Sorting01IconSvg, 'Sorting01Icon');
export const SparklesIcon = createCompatIcon(SparklesIconSvg, 'SparklesIcon');
export const SmartPhone01Icon = createCompatIcon(SmartPhone01IconSvg, 'SmartPhone01Icon');
export const StopIcon = createCompatIcon(StopIconSvg, 'StopIcon');
export const TaskDone01Icon = createCompatIcon(TaskDone01IconSvg, 'TaskDone01Icon');
export const TaskEdit01Icon = createCompatIcon(TaskEdit01IconSvg, 'TaskEdit01Icon');
export const ThumbsUpIcon = createCompatIcon(ThumbsUpIconSvg, 'ThumbsUpIcon');
export const Tick01Icon = createCompatIcon(Tick01IconSvg, 'Tick01Icon');
export const Tick02Icon = createCompatIcon(Tick02IconSvg, 'Tick02Icon');
export const Upload04Icon = createCompatIcon(Upload04IconSvg, 'Upload04Icon');
export const UserCircleIcon = createCompatIcon(UserCircleIconSvg, 'UserCircleIcon');
export const UserIcon = createCompatIcon(UserIconSvg, 'UserIcon');
export const UserMultiple02Icon = createCompatIcon(UserMultiple02IconSvg, 'UserMultiple02Icon');
export const Video01Icon = createCompatIcon(Video01IconSvg, 'Video01Icon');
export const ViewIcon = createCompatIcon(ViewIconSvg, 'ViewIcon');
export const ViewOffIcon = createCompatIcon(ViewOffIconSvg, 'ViewOffIcon');
export const WasteIcon = createCompatIcon(WasteIconSvg, 'WasteIcon');
export const Home01Icon = createCompatIcon(Home01IconSvg, 'Home01Icon');

export const CalendarAverageIcon = Calendar01Icon;
export const MedalFirstIcon = ChampionIcon;
export const MultiBubbleIcon = BubbleChatIcon;