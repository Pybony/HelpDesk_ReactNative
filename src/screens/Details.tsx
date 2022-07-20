import { useEffect, useState } from 'react';
import { VStack, Text, HStack, useTheme, ScrollView } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Car, CircleWavyCheck, Hourglass, DesktopTower, ClipboardText } from 'phosphor-react-native';

import { Header } from '../components/Header';
import { OrdersProps } from '../components/Order';
import { Loading } from '../components/Loading';
import { CardDetails } from '../components/CardDetails';
import { Button } from '../components/Button';

import { OrderFirestoreDTO } from '../DTO/OrderFirestoreDTO';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Input } from '../components/Input';
import { Alert } from 'react-native';

type RouteParams = {
  orderId: string;
}

type OrderDetails = OrdersProps & {
  description: string;
  solution: string;
  closed: string;
}

export function Details() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [solution, setSolution]= useState('');
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);

  const route = useRoute();
  const { colors } = useTheme();
  const {orderId} = route.params as RouteParams;

function handleOrderClose(){
  if(!solution){
    return Alert.alert('Encerrar', 'Informe a solução para encerrar o chamado');
  }

  firestore()
  .collection<OrderFirestoreDTO>('orders')
  .doc(orderId)
  .update({
    status: 'closed',
    solution,
    closed_at: firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    Alert.alert('Registrar', 'Chamado encerrado.');
    navigation.goBack();
  })
  .catch((error) => {
    console.log(error);
    Alert.alert('Registrar', 'Não foi possível encerrar o chamado.')
  })
}

useEffect(() => {
  firestore()
  .collection<OrderFirestoreDTO>('orders')
  .doc(orderId)
  .get()
  .then((doc) => {
    const { patrimony, description, status, created_at, closed_at, solution } = doc.data();

    const closed = closed_at ? dateFormat(closed_at) : null;

    setOrder({
      id: doc.id,
      patrimony,
      description,
      status,
      solution,
      when: dateFormat(created_at),
      closed
    });

    setIsLoading(false);
  })
});

if (isLoading) {
  <Loading />
}

  return (
    <VStack flex={1} bg="gray.700">
        <Header title="Chamado" />
        <HStack
          bg="gray.500"
          justifyContent="center"
          p={4}
        >
          {
            order.status === 'closed'
            ? <CircleWavyCheck size={22} color={colors.green[300]} />
            : <Hourglass size={22} color={colors.secondary[700]} />
          }

          <Text
            fontSize="sm"
            color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
            ml={2}
            textTransform="uppercase"
          >
            {order.status === 'closed' ? 'finalizado' : 'em andamento'}
          </Text>
        </HStack>
        <ScrollView mx={5} showsVerticalScrollIndicator={false}>
          <CardDetails 
            title="equipamento"
            description={`Patrimônio ${order.patrimony}`}
            icon={DesktopTower}
          />

          <CardDetails 
            title="descrição do problema"
            description={order.description}
            icon={ClipboardText}
            footer={`Regisrado em ${order.when}`}
          />

          <CardDetails 
            title="solução"
            icon={CircleWavyCheck}
            description={order.solution}
            footer={order.closed && `Encerrado em  ${order.closed}`}
          >
            {
              order.status === 'open' &&
               <Input 
               placeholder='Descrição da solução'
               onChangeText={setSolution}
               textAlignVertical="top"
               multiline
               h={24}
             />
            }
          </CardDetails>
        </ScrollView>

        {
          order.status === 'open' &&
          <Button 
            title="Encerrar solicitação"
            m={5}
            onPress={handleOrderClose}
          />
        }

    </VStack>
  );
}