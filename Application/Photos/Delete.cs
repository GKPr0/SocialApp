using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos;

public class Delete
{
    public class Command : IRequest<Result<Unit>>
    {
        public string Id { get; set; }
    }


    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext context;
        private readonly IPhotoAccessor photoAccessor;
        private readonly IUserAccessor userAccessor;

        public Handler(DataContext context, IPhotoAccessor photoAccessor, IUserAccessor userAccessor)
        {
            this.photoAccessor = photoAccessor;
            this.userAccessor = userAccessor;
            this.context = context;
        }
                 
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(u => u.UserName == userAccessor.GetUserName());

            if(user == null)
                return Result<Unit>.Failure("Unable to find user");

            var photo = user.Photos.FirstOrDefault(p => p.Id == request.Id);

            if(photo == null)
                return Result<Unit>.Failure("Photo not found");

            if(photo.IsMain)
                return Result<Unit>.Failure("You cannot delete your main photo");

            var result = photoAccessor.DeletePhoto(photo.Id);

            if(result == null)
                return Result<Unit>.Failure("Problem deleting the photo from Cloudinary");

            user.Photos.Remove(photo);

            var success = await context.SaveChangesAsync() > 0;

            if(!success)
                return Result<Unit>.Failure("Problem deleting the photo from API");

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
