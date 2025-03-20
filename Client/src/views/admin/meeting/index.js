import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { getApi } from 'services/api';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { toast } from 'react-toastify';
import { deleteMeeting, deleteMultipleMeetings, fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch, useSelector } from 'react-redux';

const Index = () => {
    const title = "Meeting"; 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // State variables for handling various UI interactions
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [selectedId, setSelectedId] = useState();
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const [deleteMany, setDeleteMany] = useState(false);
    const [deleteOne, setDeleteOne] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);

    // Fetching the current user from local storage
    const user = JSON.parse(localStorage.getItem("user"));

    // Checking user permissions for meetings
    const [permission] = HasAccess(['Meetings']);

    // Fetching meeting data from Redux store
    const { data, isLoading } = useSelector((state) => state.meetingData);

    // Fetch meetings when the component mounts
    useEffect(() => {
        dispatch(fetchMeetingData());
    }, [dispatch]);

    // Define action buttons in the table
    const actionHeader = {
        Header: "Action", isSortable: false, center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy>
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>
                        {/* View Meeting */}
                        {permission?.view && <MenuItem py={2.5} color={'green'}
                            onClick={() => navigate(`/metting/${row?.values._id}`)}
                            icon={<ViewIcon fontSize={15} />}>View</MenuItem>}
                        {/* Delete Meeting */}
                        {permission?.delete && <MenuItem py={2.5} color={'red'} onClick={() => { setDeleteOne(true); setSelectedId(row?.values?._id); }} icon={<DeleteIcon fontSize={15} />}>Delete</MenuItem>}
                    </MenuList>
                </Menu>
            </Text>
        )
    };

    // Define table columns
    const tableColumns = [
        {
            Header: "#",
            accessor: "_id",
            isSortable: false,
            width: 10
        },
        {
            Header: 'Agenda', 
            accessor: 'agenda', 
            cell: (cell) => (
                <Link to={`/metting/${cell?.row?.values._id}`}> 
                    <Text
                        me="10px"
                        sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                        color='brand.600'
                        fontSize="sm"
                        fontWeight="700"
                    >
                        {cell?.value || ' - '}
                    </Text>
                </Link>
            )
        },
        { Header: "Date & Time", accessor: "dateTime" },
        { Header: "Time Stamp", accessor: "timestamp" },
        { 
            Header: "Created By", 
            accessor: "createBy",
            cell: (cell) => 
                cell?.value ? `${cell.value.firstName} ${cell.value.lastName}` : '-'
        },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
    ];

    // Function to handle bulk deletion of meetings
    const handleDeleteMeeting = async (ids) => {
        try {
            const result = await dispatch(deleteMultipleMeetings(ids));
            if (deleteMultipleMeetings.fulfilled.match(result)) {
                toast.success("Meetings deleted successfully");
                setSelectedValues([]);
                setDeleteMany(false);
            } else {
                toast.error("Failed to delete meetings");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while deleting");
        }
    };

    // Function to handle single meeting deletion
    const handleDeleteOneMeeting = async (id) => {
        try {
            const result = await dispatch(deleteMeeting(id));
            if (deleteMeeting.fulfilled.match(result)) {
                toast.success("Meeting deleted successfully");
                setSelectedId(null);
                setDeleteOne(false);
            } else {
                toast.error("Failed to delete meeting");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while deleting");
        }
    };

    return (
        <div>
            {/* Common table component for listing meetings */}
            <CommonCheckTable
                title={title}
                isLoding={isLoding}
                columnData={tableColumns ?? []}
                // dataColumn={dataColumn ?? []}
                allData={data ?? []}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                // action={action}
                // setAction={setAction}
                // selectedColumns={selectedColumns}
                // setSelectedColumns={setSelectedColumns}
                // isOpen={isOpen}
                // onClose={onClose}
                onOpen={onOpen}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button variant="outline" colorScheme='brand' leftIcon={<SearchIcon />} mt={{ sm: "5px", md: "0" }} size="sm" onClick={() => setAdvanceSearch(true)}>Advance Search</Button>
                }
                getTagValuesOutSide={getTagValuesOutSide}
                searchboxOutside={searchboxOutside}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            {/* Advanced Search Modal */}
            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />

            {/* Add Meeting Modal */}
            <AddMeeting setAction={setAction} isOpen={isOpen} onClose={onClose} />

            {/* Delete Confirmation Modal for Single Meeting */}
            <CommonDeleteModel isOpen={deleteOne} onClose={() => setDeleteOne(false)} type='Meetings' handleDeleteData={handleDeleteOneMeeting} ids={selectedId} />

            {/* Delete Confirmation Modal for Multiple Meetings */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={selectedValues} />
        </div>
    );
};

export default Index;
