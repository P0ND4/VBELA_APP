import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editReservation } from "@api";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { random } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";

const AddReservation = ({ personSelected, modalVisible, setModalVisible }) => {
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const [changeKey, setChangeKey] = useState(Math.random());
  const [daySelected, setDaySelected] = useState(null);
  const [nomenclatureSelected, setNomenclatureSelected] = useState(null);
  const [reservationSelected, setReservationSelected] = useState(null);
  const [modalVisibleAddPerson, setModalVisibleAddPerson] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const cleanModal = () => {
    setModalVisible(!modalVisible);
    setModalVisibleAddPerson(!modalVisibleAddPerson);
    setDaySelected(null);
    setReservationSelected(null);
    setNomenclatureSelected(null);
  };

  const saveHosted = async ({ data, cleanData }) => {
    const place = nomenclatures.find((n) => n.id === nomenclatureSelected?.id);

    data.owner = personSelected.id;
    data.checkOut = null;
    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });

    navigation.navigate(
      nomenclatureSelected?.type === "accommodation"
        ? "CreateAccommodationReserve"
        : "CreateStandardReserve",
      {
        date: { year: daySelected.year, month: daySelected.month, day: daySelected.day },
        place,
        hosted: [data],
      }
    );

    cleanModal();
    cleanData();
  };

  const updateHosted = async ({ data, cleanData }) => {
    if (reservationSelected?.type === "accommodation") return saveHosted({ data, cleanData });

    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });
    data.owner = personSelected.id;
    data.checkOut = null;

    let reservationREF = standardReservations.find((r) => r.id === reservationSelected.id);
    const reserveUpdated = {
      ...reservationREF,
      hosted: [...reservationREF.hosted, data],
    };
    dispatch(editRS({ id: reserveUpdated.id, data: reserveUpdated }));
    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reserveUpdated,
        type: "standard",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
    cleanModal();
    cleanData();
  };

  return (
    <>
      <ChooseDate
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onDayPress={({ data, nomenclatureID, markedDates }) => {
          const reservation = markedDates[data.dateString]?.reservation;
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (reservation?.type === "standard" && nom.people === reservation?.hosted?.length)
            return Alert.alert(
              "OOPS",
              "Ha superado el monto máximo de huéspedes permitidos en la habitación"
            );

          setChangeKey(Math.random());
          setNomenclatureSelected(nom);
          setDaySelected({
            year: data.year,
            month: data.month - 1,
            day: data.day,
          });
          setReservationSelected(reservation || null);
          setModalVisibleAddPerson(!modalVisibleAddPerson);
        }}
      />
      <AddPerson
        key={changeKey}
        modalVisible={modalVisibleAddPerson}
        setModalVisible={setModalVisibleAddPerson}
        editing={{
          active: true,
          fullName: personSelected?.name,
          identification: personSelected?.identification,
        }}
        settings={{ days: nomenclatureSelected?.type === "accommodation" }}
        handleSubmit={(data) => (!reservationSelected ? saveHosted(data) : updateHosted(data))}
        type={nomenclatureSelected?.type}
      />
    </>
  );
};

export default AddReservation;
