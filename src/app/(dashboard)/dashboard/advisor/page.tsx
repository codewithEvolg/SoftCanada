﻿"use client";

import { Advisor } from "@/app/types/advisor";
import { Booking } from "@/app/types/booking";
import ListAdvisors from "@/components/dashboard/advisor/ListAdvisors";
import ListBookingHistory, {
  ListBookingHistoryRef,
} from "@/components/dashboard/advisor/ListBookingHistory";
import ListBookings, {
  ListBookingsRef,
} from "@/components/dashboard/advisor/ListBookings";
import { ScheduleMeetingModal } from "@/components/dashboard/advisor/ScheduleMeetingModal";
import { useApiClient } from "@/hooks/api-hook";
import { useUser } from "@auth0/nextjs-auth0";
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  message,
  Space,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { useRef, useState } from "react";
import { HiMiniUsers } from "react-icons/hi2";
import { LuCalendarClock, LuCalendarDays } from "react-icons/lu";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const { Text, Title } = Typography;

export type MeetingType = {
  advisor: Advisor;
  startDate: Dayjs;
  endDate: Dayjs;
  notes?: string;
};

const TabKeys = {
  Advisors: "advisors_list",
  UpcomingMeetings: "current_sessions_list",
  MeetingHistory: "past_sessions_list",
} as const;

export default function CareerAdvisorPage() {
  const { user } = useUser();

  const [showMeetingScheduleModal, setShowMeetingScheduleModal] =
    useState(false);
  const { post } = useApiClient();
  const [showMeetingDetailsDrawer, setShowMeetingDetailsDrawer] =
    useState(false);
  const bookingsRef = useRef<ListBookingsRef>(null);
  const bookingHistoryRef = useRef<ListBookingHistoryRef>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor>();
  const [messageApi, contextHolder] = message.useMessage();
  const [isBookSessionLoading, setIsBookSessionLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking>();
  const [pageTab, setPageTab] = useState<string>(TabKeys.Advisors);

  const handleBookSessionClicked = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setShowMeetingScheduleModal(true);
  };

  const confirmMeetingSchedule = async (meeting: MeetingType) => {
    try {
      setIsBookSessionLoading(true);
      const result = await post<Booking, MeetingType>(
        `/api/advisors/${meeting.advisor.id}/book`,
        meeting
      );
      messageApi.success("Booking confirmed!");
      setShowMeetingScheduleModal(false);
      return result;
    } finally {
      setIsBookSessionLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setPageTab(key);
    if (key === TabKeys.UpcomingMeetings) {
      bookingsRef.current?.refresh();
    } else if (key === TabKeys.MeetingHistory) {
      bookingHistoryRef.current?.refresh();
    }
  };

  const handleShowMeetingInfo = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowMeetingDetailsDrawer(true);
  };
  const closeDrawer = () => {
    setShowMeetingDetailsDrawer(false);
    setSelectedBooking(undefined);
  };

  const handleCancelBooking = async (booking: Booking) => {
    await post(`/api/advisors/bookings/${booking.id}/cancel`);
    messageApi.success("Booking cancelled!");
    bookingsRef.current?.refresh();
  };

  const tabItems: TabsProps["items"] = [
    {
      key: TabKeys.Advisors,
      label: <span className="pl-3">Advisors</span>,
      icon: <HiMiniUsers size={20} className="-mb-5" />,
      children: (
        <ListAdvisors
          onBookSessionClick={handleBookSessionClicked}
          isBookSessionLoading={isBookSessionLoading}
        />
      ),
    },
    {
      key: TabKeys.UpcomingMeetings,
      label: <span className="pl-3">Upcoming Sessions</span>,
      icon: <LuCalendarDays size={20} className="-mb-5" />,
      children: (
        <ListBookings
          ref={bookingsRef}
          onDetails={handleShowMeetingInfo}
          onCancel={handleCancelBooking}
        />
      ),
    },
    {
      key: TabKeys.MeetingHistory,
      label: <span className="pl-3">Past Sessions</span>,
      icon: <LuCalendarClock size={20} className="-mb-5" />,
      children: <ListBookingHistory ref={bookingHistoryRef} />,
    },
  ];

  return (
    <>
      <div className="p-2.5 sm:p-6 bg-white min-h-[360px]">
        <div className="mb-6">
          {pageTab === TabKeys.Advisors && (
            <>
              <Title level={1}>Advisors</Title>
              <span className="text-gray-800 font-normal text-xl">
                Get advice from our expert advisors
              </span>
            </>
          )}
          {pageTab === TabKeys.UpcomingMeetings && (
            <>
              <Title level={1}>Upcoming Meetings</Title>
              <span className="text-gray-800 font-normal text-xl">
                Stay on top of your schedule and connect with your advisors on
                time.
              </span>
            </>
          )}
          {pageTab === TabKeys.MeetingHistory && (
            <>
              <Title level={1}>Meeting History</Title>
              <span className="text-gray-800 font-normal text-xl">
                View and track your past meetings with advisors
              </span>
            </>
          )}
        </div>

        <Tabs items={tabItems} onChange={handleTabChange} />
      </div>

      {selectedAdvisor && (
        <ScheduleMeetingModal
          open={showMeetingScheduleModal}
          advisor={selectedAdvisor}
          onCancel={() => setShowMeetingScheduleModal(false)}
          onSave={confirmMeetingSchedule}
        />
      )}

      <Drawer
        title="Meeting Details"
        onClose={() => setShowMeetingDetailsDrawer(false)}
        open={showMeetingDetailsDrawer}
      >
        {selectedBooking && (
          <div className="flex flex-col items-center space-y-4 py-4">
            {/* Avatars of Advisor + User */}
            <Avatar.Group size="large">
              <Avatar
                src={selectedBooking.advisor.profilePictureUrl}
                style={{ border: "2px solid #1890ff" }}
              />
              <Avatar
                src={user?.picture}
                style={{ border: "2px solid #1890ff" }}
              />
            </Avatar.Group>

            {/* Meeting Headline */}
            <Space direction="vertical" align="center">
              <Title level={5} className="m-0 !mb-2">
                {`Meeting with ${selectedBooking.advisor.name}`}
              </Title>
              <Text type="secondary" className="capitalize">
                Hosted on Google Meet
              </Text>
            </Space>

            <Divider />

            {/* Meeting Date & Time */}
            <Space direction="vertical" align="center">
              <Text strong>Date & Time</Text>
              <Text>
                {dayjs
                  .utc(selectedBooking.startDate)
                  .local()
                  .format("MMM D, YYYY")}{" "}
                at{" "}
                {dayjs.utc(selectedBooking.startDate).local().format("hh:mm A")}
              </Text>
            </Space>

            <Divider />

            {/* Notes */}
            {selectedBooking.notes && (
              <Space direction="vertical" align="start" className="w-full">
                <Text strong>Purpose of meeting</Text>
                <Text>{selectedBooking.notes}</Text>
              </Space>
            )}

            {/* (Optional) Some action button in the Drawer */}
            <Button type="primary" block onClick={() => closeDrawer()}>
              Got It
            </Button>
          </div>
        )}
      </Drawer>

      {contextHolder}
    </>
  );
}

