
using Application.Activities;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Activity, Activity>();

        CreateMap<Activity, ActivityDTO>()
            .ForMember(d => d.HostUsername, options => options.MapFrom(source => source.Attendees
                .FirstOrDefault(x => x.IsHost).AppUser.UserName));

        CreateMap<ActivityAttendee, Profiles.Profile>()
            .ForMember(d => d.DisplayName, options => options.MapFrom(source => source.AppUser.DisplayName))
            .ForMember(d => d.Username, options => options.MapFrom(source => source.AppUser.UserName))
            .ForMember(d => d.Bio, options => options.MapFrom(source => source.AppUser.Bio));
    }   
}
